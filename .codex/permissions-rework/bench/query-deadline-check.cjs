const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { performance } = require('node:perf_hooks');
const { Client, Pool } = require('pg');

const connection = {
  host: 'localhost',
  port: 5432,
  user: 'charles',
  database: 'permissions_rework_bench_20261026',
};
const results = [];
const observer = new Client({ ...connection, application_name: 'permission_deadline_observer' });

async function observeBackend(processId) {
  const result = await observer.query(
    'SELECT pid, state, wait_event_type, wait_event FROM pg_stat_activity WHERE pid = $1',
    [processId],
  );
  return result.rows[0] ?? null;
}

async function checkDriverTimeout() {
  const pool = new Pool({
    ...connection, max: 1, query_timeout: 100, statement_timeout: 0,
    application_name: 'permission_driver_timeout_probe',
  });
  try {
    const processId = (await pool.query('SELECT pg_backend_pid() AS pid')).rows[0].pid;
    const started = performance.now();
    let error;
    try {
      await pool.query('SELECT pg_sleep(1)');
    } catch (caught) {
      error = caught;
    }
    const elapsedMs = performance.now() - started;
    assert.equal(error?.message, 'Query read timeout');
    const backendAfterClientTimeout = await observeBackend(processId);
    results.push({
      case: 'driver_query_timeout_100ms', elapsedMs,
      error: error.message, backendAfterClientTimeout,
    });
    // The short sleep finishes naturally even if closing the socket does not interrupt it.
    await new Promise((resolve) => setTimeout(resolve, 1100));
    results.at(-1).backendAfterNaturalCompletion = await observeBackend(processId);
  } finally {
    await pool.end();
  }
}

async function checkServerTimeout(query, label) {
  const pool = new Pool({
    ...connection, max: 1, query_timeout: 2000,
    application_name: 'permission_server_timeout_probe',
  });
  const client = await pool.connect();
  try {
    const processId = (await client.query('SELECT pg_backend_pid() AS pid')).rows[0].pid;
    await client.query('BEGIN');
    await client.query("SELECT set_config('statement_timeout', '200ms', true)");
    const started = performance.now();
    let error;
    try {
      await client.query(query);
    } catch (caught) {
      error = caught;
    }
    const elapsedMs = performance.now() - started;
    assert.equal(error?.code, '57014');
    assert.match(error.message, /statement timeout/);
    const backendAfterServerTimeout = await observeBackend(processId);
    const cleanupStarted = performance.now();
    await client.query('ROLLBACK');
    const cleanupMs = performance.now() - cleanupStarted;
    const elapsedUntilRollbackMs = performance.now() - started;
    const backendAfterRollback = await observeBackend(processId);
    const recoveryStarted = performance.now();
    const recovered = await client.query('SELECT 1 AS recovered, pg_backend_pid() AS pid');
    const recoveryMs = performance.now() - recoveryStarted;
    assert.equal(recovered.rows[0].recovered, 1);
    assert.equal(recovered.rows[0].pid, processId);
    const resetTimeout = (await client.query('SHOW statement_timeout')).rows[0].statement_timeout;
    results.push({
      case: label, elapsedMs, sqlState: error.code, message: error.message,
      backendAfterServerTimeout, cleanupMs, elapsedUntilRollbackMs,
      backendAfterRollback, recoveryMs, sameConnectionRecovered: true,
      timeoutAfterRollback: resetTimeout,
    });
  } finally {
    client.release();
    await pool.end();
  }
}

async function main() {
  await observer.connect();
  try {
    await checkDriverTimeout();
    await checkServerTimeout('SELECT pg_sleep(1)', 'server_statement_timeout_sleep_200ms');
    const cases = JSON.parse(fs.readFileSync(path.join(__dirname, 'separate-access-late-fetch-results.json'), 'utf8'));
    const slowQuery = cases.find((entry) => entry.case === 'global_oldest_only' && entry.layout === 'separate_edges').query;
    for (let repetition = 0; repetition < 3; repetition++) {
      await checkServerTimeout(slowQuery, 'server_statement_timeout_actual_slow_query_200ms');
    }
    fs.writeFileSync(path.join(__dirname, 'query-deadline-results.json'), JSON.stringify({
      postgres: (await observer.query('SELECT version()')).rows[0].version,
      driverVersion: require('pg/package.json').version,
      results,
      limitation: 'Local cancellation and connection-recovery probe. This is not a multi-tenant load test or a hard real-time cancellation guarantee.',
    }, null, 2) + '\n');
    console.log(JSON.stringify(results, null, 2));
  } finally {
    await observer.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
