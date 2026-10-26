const fs = require('node:fs');
const path = require('node:path');
const { performance } = require('node:perf_hooks');
const { Client } = require('pg');

const connection = { host: 'localhost', port: 5432, user: 'charles', database: 'permissions_rework_bench_20261026' };
const actions = ['readable', 'writable', 'soft_deletable', 'destroyable', 'shareable', 'receivable'];
const targetGroup = '00000000-0000-0000-0000-000000000007';
const results = { setup: { rows: 250000, existingTableRows: 10000000, targetRowsPerSecond: 3000, ginPendingListLimitKilobytes: 256, actionColumns: 6, accessIndexes: 1, businessIndexes: 4, batchSize: 250, writeStatementTimeoutMs: 2000, readStatementTimeoutMs: 200 }, micro: [], phases: {} };
const output = path.join(__dirname, 'on-record-gin256-write-results.json');
const save = () => fs.writeFileSync(output, JSON.stringify(results, null, 2) + '\n');
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const percentile = (values, fraction) => values.length ? [...values].sort((a, b) => a - b)[Math.min(values.length - 1, Math.floor(values.length * fraction))] : null;
const summarize = (samples) => {
  const completed = samples.filter((entry) => !entry.error).map((entry) => entry.elapsedMs);
  return { samples: samples.length, errors: samples.filter((entry) => entry.error).length, p50Ms: percentile(completed, 0.5), p95Ms: percentile(completed, 0.95), p99Ms: percentile(completed, 0.99), maxMs: completed.length ? Math.max(...completed) : null, samplesDetail: samples };
};

async function snapshot(client) {
  await client.query('SELECT pg_stat_clear_snapshot()');
  return {
    walLsn: (await client.query('SELECT pg_current_wal_insert_lsn() AS lsn')).rows[0].lsn,
    tables: (await client.query("SELECT relname, pg_relation_size(relid)::text AS heap_bytes, pg_indexes_size(relid)::text AS index_bytes, pg_total_relation_size(relid)::text AS total_bytes, n_live_tup, n_dead_tup, n_tup_upd, n_tup_hot_upd, autovacuum_count, last_autovacuum FROM pg_stat_user_tables WHERE relname IN ('permission_write_record', 'permission_write_sidecar')")).rows,
  };
}

const readQueries = {
  other_table_dense: "SELECT id, name FROM permission_record WHERE deleted_at IS NULL AND readable_role_ids && ARRAY['00000000-0000-0000-0000-000000000001'::uuid] ORDER BY created_at DESC, id DESC LIMIT 50",
  other_table_sparse: "SELECT id, name FROM permission_record WHERE deleted_at IS NULL AND readable_role_ids && ARRAY['00000000-0000-0000-0000-000005f5e12a'::uuid] ORDER BY created_at DESC, id DESC LIMIT 50",
  same_table_sparse_city: "SELECT id, name FROM permission_write_record WHERE city = 'City-42' AND readable && ARRAY['00000000-0000-0000-0000-000005f5e12a'::uuid] ORDER BY created_at DESC, id DESC LIMIT 50",
};

async function withReaders(phaseName, work) {
  let active = true;
  const clients = await Promise.all(Object.keys(readQueries).map(async () => {
    const client = new Client({ ...connection, statement_timeout: 200, query_timeout: 2000, application_name: 'permission_write_read_probe' });
    await client.connect();
    return client;
  }));
  const samples = {};
  const readers = Object.entries(readQueries).map(async ([name, query], index) => {
    samples[name] = [];
    while (active) {
      const started = performance.now();
      try {
        const result = await clients[index].query(query);
        samples[name].push({ elapsedMs: performance.now() - started, rows: result.rowCount });
      } catch (error) {
        samples[name].push({ elapsedMs: performance.now() - started, error: error.code ?? error.message });
      }
      await sleep(Math.max(0, 100 - (performance.now() - started)));
    }
  });
  try {
    await work();
  } finally {
    active = false;
    await Promise.all(readers);
    await Promise.all(clients.map((client) => client.end()));
    results.phases[phaseName] = Object.fromEntries(Object.entries(samples).map(([name, entries]) => [name, summarize(entries)]));
    save();
  }
}

async function main() {
  const writer = new Client({ ...connection, statement_timeout: 2000, query_timeout: 10000, application_name: 'permission_projection_write_probe' });
  const maintenance = new Client({ ...connection, statement_timeout: 60000, query_timeout: 65000, application_name: 'permission_projection_maintenance_probe' });
  await writer.connect();
  await maintenance.connect();
  try {
    await maintenance.query("ALTER INDEX permission_write_record_readable SET (gin_pending_list_limit = 256)");
    results.before = await snapshot(maintenance);
    const ids = (await writer.query("SELECT id FROM permission_write_record WHERE created_at >= '2020-01-01'::timestamptz + interval '10001 seconds' AND created_at < '2020-01-01'::timestamptz + interval '11001 seconds' ORDER BY created_at")).rows.map((row) => row.id);
    save();
    await withReaders('baseline', () => sleep(10000));
    results.beforeRebuild = await snapshot(maintenance);
    results.batches = [];
    const started = performance.now();
    let affectedRows = 0;
    let batchSize = 250;
    const assignments = actions.map((action) => `${action} = array_append(${action}, $3::uuid)`).join(', ');
    await withReaders('rebuild', async () => {
      for (let first = 1; first <= 250000;) {
        const last = Math.min(first + batchSize, 250001);
        const batchStarted = performance.now();
        try {
          const result = await writer.query(`UPDATE permission_write_record SET ${assignments}, permission_version = permission_version + 1 WHERE created_at >= '2020-01-01'::timestamptz + $1::bigint * interval '1 second' AND created_at < '2020-01-01'::timestamptz + $2::bigint * interval '1 second' AND NOT (readable @> ARRAY[$3::uuid])`, [first, last, targetGroup]);
          affectedRows += result.rowCount;
          results.batches.push({ first, last, rows: result.rowCount, elapsedMs: performance.now() - batchStarted });
          first = last;
          await sleep(Math.max(0, ((last - results.batches.at(-1).first) / 3000) * 1000 - (performance.now() - batchStarted)));
          if ((first - 1) % 250000 === 0 || first === 250001) {
            results.rebuildProgress = { scannedRows: first - 1, affectedRows, elapsedMs: performance.now() - started };
            save();
            console.log(JSON.stringify(results.rebuildProgress));
          }
        } catch (error) {
          results.batches.push({ first, last, error: error.code ?? error.message, elapsedMs: performance.now() - batchStarted });
          if (error.code !== '57014' || batchSize <= 125) throw error;
          batchSize = Math.max(125, Math.floor(batchSize / 2));
        }
      }
    });
    const elapsedMs = performance.now() - started;
    await writer.query('SELECT pg_stat_force_next_flush()');
    results.afterRebuild = await snapshot(maintenance);
    results.rebuild = {
      affectedRows, elapsedMs, rowsPerSecond: affectedRows / (elapsedMs / 1000),
      batchLatency: summarize(results.batches),
      clusterWalBytes: (await maintenance.query('SELECT pg_wal_lsn_diff($1::pg_lsn, $2::pg_lsn)::text AS bytes', [results.afterRebuild.walLsn, results.beforeRebuild.walLsn])).rows[0].bytes,
    };
    delete results.rebuild.batchLatency.samplesDetail;
    const allContainTarget = actions.map((action) => `${action} @> ARRAY[$1::uuid]`).join(' AND ');
    const noOp = await writer.query(`EXPLAIN (ANALYZE, BUFFERS, WAL, TIMING OFF, FORMAT JSON) UPDATE permission_write_record SET permission_version = permission_version + 1 WHERE id = ANY($2::uuid[]) AND NOT (${allContainTarget})`, [targetGroup, ids]);
    results.noOp = noOp.rows[0]['QUERY PLAN'][0];
    save();
    await withReaders('after', () => sleep(10000));
    results.limitations = 'Local PostgreSQL 15.14; synthetic inline business payload 256 bytes, six small arrays, one GIN and four B-trees. Logged projection writes, not RLS/inheritance evaluation or revision retirement. Rate-limited 250K-row follow-up with a 256 KiB GIN pending-list limit, after the prior throttled run; cache, vacuum and array lengths differ, so this is not an isolated causal comparison; not a complete 10M rate-limited run. Three fixed read probes at up to 10 QPS each are not a 1000-user multi-tenant load test. Cluster WAL delta can include concurrent cluster maintenance and other app writes. No failover/replica or distributed admission benchmark.';
    save();
    console.log(JSON.stringify({ rebuild: results.rebuild, vacuum: results.vacuum, phases: Object.fromEntries(Object.entries(results.phases).map(([name, phase]) => [name, Object.fromEntries(Object.entries(phase).map(([query, samples]) => [query, { ...samples, samplesDetail: undefined }]))])) }, null, 2));
  } finally {
    await maintenance.query("ALTER INDEX permission_write_record_readable RESET (gin_pending_list_limit)");
    await Promise.allSettled([writer.end(), maintenance.end()]);
  }
}

main().catch((error) => { results.failure = { message: error.message, code: error.code }; save(); console.error(error); process.exitCode = 1; });
