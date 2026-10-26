import { readRecordPermissionScanBatch } from 'src/engine/core-modules/record-permission/utils/read-record-permission-scan-batch.util';
import { type RecordPermissionScan } from 'src/engine/core-modules/record-permission/types/record-permission-scan.type';
import { RowLevelPermissionPredicateOperand } from 'twenty-shared/types';
import { Client } from 'pg';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { performance } from 'node:perf_hooks';
import { writeFileSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';
import { v4, v5 } from 'uuid';
import { createRecordPermissionTestContext } from 'src/engine/core-modules/record-permission/utils/__tests__/record-permission-test-context';
import { recomputeRecordPermissionBatch } from 'src/engine/core-modules/record-permission/utils/recompute-record-permission-batch.util';
import { resolveRecordPermissionAccessGroups } from 'src/engine/core-modules/record-permission/utils/resolve-record-permission-access-groups.util';
import { compileRecordPermission } from 'src/engine/core-modules/record-permission/utils/compile-record-permission.util';
import { compileNamedParameters } from 'src/engine/twenty-orm/sql/utils/compile-named-parameters.util';
import { type SqlCondition } from 'src/engine/twenty-orm/types/row-access-policy.type';

async function main() {
  const connectionString = process.env.PERMISSION_BENCHMARK_DATABASE_URL;
  if (
    !connectionString ||
    !new URL(connectionString).pathname.includes('permission') ||
    !new URL(connectionString).pathname.includes('bench')
  ) {
    throw new Error(
      'Set PERMISSION_BENCHMARK_DATABASE_URL to a dedicated permission benchmark database',
    );
  }
  const reportPath =
    process.env.PERMISSION_BENCHMARK_REPORT ??
    join(tmpdir(), 'record-permission-benchmark-results.json');
  const fixture = createRecordPermissionTestContext();
  const { context, objects, rule } = fixture;
  context.schemaName = 'compiler_benchmark';
  context.definition.objects.forEach((object) => {
    object.inheritancePaths = [];
  });
  rule.condition = null;
  rule.actions = ['receive'];
  const base = resolveRecordPermissionAccessGroups({
    revisionId: context.revisionId,
    definition: context.definition,
    authority: context.authorities[0],
    metadata: context,
  })[0];
  const recipients = Array.from({ length: 1000 }, () => {
    const principalId = v4();
    return {
      principalId,
      groupId: v5(
        JSON.stringify([rule.universalIdentifier, null, principalId]),
        context.revisionId,
      ),
    };
  });
  context.authorities[0].workspaceMember = {
    id: recipients[0].principalId,
  } as NonNullable<(typeof context.authorities)[0]['workspaceMember']>;
  const rebuildRole = { roleId: v4(), roleUniversalIdentifier: v4() };
  context.definition.objects[0].rules.push({
    ...rule,
    universalIdentifier: v4(),
    roleUniversalIdentifier: rebuildRole.roleUniversalIdentifier,
    actions: ['read'],
    condition: {
      kind: 'predicate',
      fieldUniversalIdentifier: fixture.city.universalIdentifier,
      operand: RowLevelPermissionPredicateOperand.CONTAINS,
      value: 'City-',
    },
  });
  const rebuildGroups = resolveRecordPermissionAccessGroups({
    revisionId: context.revisionId,
    definition: context.definition,
    authority: rebuildRole,
    metadata: context,
  });
  const groups = [
    ...rebuildGroups,
    base,
    ...recipients.map(({ principalId, groupId }) => ({
      ...base,
      id: groupId,
      sharePrincipalIds: [principalId],
    })),
  ];
  const client = new Client({
    connectionString,
    application_name: 'record_permission_compiler_benchmark',
  });
  await client.connect();
  const database = {
    query: async (sql: string, parameters?: unknown[]) => {
      return (await client.query(sql, parameters)).rows;
    },
  };
  const columns = [
    'readableByAccessGroupIds',
    'writableByAccessGroupIds',
    'softDeletableByAccessGroupIds',
    'destroyableByAccessGroupIds',
    'shareableByAccessGroupIds',
    'receivableByAccessGroupIds',
  ];
  const report: Record<string, unknown> = {
    rows: 10000000,
    members: 1000,
    shares: 50000,
    startedAt: new Date().toISOString(),
  };
  const save = () => writeFileSync(reportPath, JSON.stringify(report, null, 2));
  try {
    await client.query('CREATE SCHEMA IF NOT EXISTS compiler_benchmark');
    const existing = (
      await client.query(
        "SELECT to_regclass('compiler_benchmark.company') AS existing",
      )
    ).rows[0].existing;
    if (!existing) {
      await client.query(
        `CREATE TABLE compiler_benchmark.company AS SELECT md5(number::text)::uuid AS id, 'Company ' || number AS name, 'City-' || (number % 1000) AS city, timestamp '2020-01-01' + number * interval '1 second' AS created_at, repeat('x', 256) AS business_payload, NULL::timestamptz AS "deletedAt", ${columns.map((column) => `'{}'::uuid[] AS "${column}"`).join(', ')} FROM generate_series(1, 10000000) number`,
      );
      await client.query(
        'ALTER TABLE compiler_benchmark.company ADD PRIMARY KEY(id)',
      );
      await client.query(
        'CREATE INDEX company_created ON compiler_benchmark.company(created_at, id)',
      );
      await client.query(
        'CREATE INDEX company_city ON compiler_benchmark.company(city, created_at, id)',
      );
      await client.query(
        'CREATE INDEX company_name ON compiler_benchmark.company(name)',
      );
      await client.query(
        'CREATE INDEX company_access ON compiler_benchmark.company USING gin("readableByAccessGroupIds")',
      );
    }
    await client.query(
      'CREATE TABLE IF NOT EXISTS compiler_benchmark."recordShare" (id uuid PRIMARY KEY, "objectMetadataId" uuid, "recordId" uuid, "principalId" uuid, "accessLevel" text, "deletedAt" timestamptz)',
    );
    await client.query(
      'CREATE INDEX IF NOT EXISTS share_record ON compiler_benchmark."recordShare" ("objectMetadataId", "recordId", "principalId")',
    );
    await client.query(
      'CREATE TABLE IF NOT EXISTS compiler_benchmark."recordPermissionState" ("activeRevisionId" uuid, "candidateRevisionId" uuid)',
    );
    await client.query(
      'CREATE TABLE IF NOT EXISTS compiler_benchmark."recordPermissionAccessGroup" (id uuid PRIMARY KEY, "revisionId" uuid)',
    );
    await client.query(
      'TRUNCATE compiler_benchmark."recordShare", compiler_benchmark."recordPermissionState", compiler_benchmark."recordPermissionAccessGroup"',
    );
    await client.query(
      'INSERT INTO compiler_benchmark."recordPermissionState" VALUES ($1,NULL)',
      [context.revisionId],
    );
    await client.query(
      'INSERT INTO compiler_benchmark."recordPermissionAccessGroup" SELECT (value->>\'id\')::uuid,$1::uuid FROM jsonb_array_elements($2::jsonb) value',
      [context.revisionId, JSON.stringify(groups)],
    );
    await client.query(
      `INSERT INTO compiler_benchmark."recordShare" SELECT md5(record.id::text || 'share')::uuid, $1::uuid, record.id, ($2::uuid[])[1 + (row_number() OVER () % 1000)::int], 'FULL', NULL FROM (SELECT id FROM compiler_benchmark.company ORDER BY id LIMIT 50000) record`,
      [
        objects.company.id,
        recipients.map((recipient) => recipient.principalId),
      ],
    );
    await client.query(
      'ALTER INDEX compiler_benchmark.company_access SET (fastupdate=off)',
    );
    await client.query('ANALYZE compiler_benchmark.company');
    await client.query(
      'CREATE SCHEMA IF NOT EXISTS core; CREATE TABLE IF NOT EXISTS core."recordPermissionRevision" (id uuid PRIMARY KEY, status text)',
    );
    await client.query(
      `INSERT INTO core."recordPermissionRevision" VALUES ($1, 'active')`,
      [context.revisionId],
    );
    await client.query('ANALYZE compiler_benchmark."recordShare"');
    const projectionQueries = new Map<string, SqlCondition>();
    const target = Number(process.env.PERMISSION_BENCH_ROWS ?? 100000);
    let scan: RecordPermissionScan = {
      blockCursor: 0,
      blockLimit: null,
      relationFileNode: null,
    };
    let processed = 0;
    const maximumBatchSize = Number(
      process.env.PERMISSION_BENCH_BATCH_SIZE ?? 1000,
    );
    let batchSize = maximumBatchSize;
    let retries = 0;
    let lastReported = 0;
    const samples: number[] = [];
    const startedAt = performance.now();
    const reader = new Client({
      connectionString,
      application_name: 'record_permission_compiler_read_probe',
      statement_timeout: 250,
    });
    await reader.connect();
    const condition = compileRecordPermission({
      context,
      action: 'read',
      objectUniversalIdentifier: objects.company.universalIdentifier,
      tableAlias: 'company',
      strategy: 'projected',
    });
    const readQuery = compileNamedParameters(
      `SELECT id FROM compiler_benchmark.company company WHERE (${condition.sql}) AND city = 'City-42' ORDER BY created_at DESC,id DESC LIMIT 50`,
      condition.parameters,
    );
    let reading = true;
    const readSamples: number[] = [];
    let readErrors = 0;
    const readWork = (async () => {
      while (reading) {
        const start = performance.now();
        try {
          await reader.query(readQuery);
          readSamples.push(performance.now() - start);
        } catch {
          readErrors++;
        }
        await delay(200);
      }
    })();
    const walBefore = (
      await client.query('SELECT pg_current_wal_lsn() AS position')
    ).rows[0].position;
    const relationBytesBefore = (
      await client.query(
        "SELECT pg_total_relation_size('compiler_benchmark.company') AS bytes",
      )
    ).rows[0].bytes;
    await client.query("SET statement_timeout = '1500ms'");
    try {
      while (target >= 10000000 || processed < target) {
        const batchStart = performance.now();
        try {
          await client.query('BEGIN');
          const batch = await readRecordPermissionScanBatch({
            database,
            schemaName: context.schemaName,
            tableName: 'company',
            scan,
            batchSize,
          });
          await recomputeRecordPermissionBatch({
            database,
            context,
            groups,
            objectUniversalIdentifier: objects.company.universalIdentifier,
            recordIds: batch.recordIds,
            projectionQueries,
          });
          await client.query('COMMIT');
          scan = {
            blockCursor: batch.blockCursor,
            blockLimit: batch.blockLimit,
            relationFileNode: batch.relationFileNode,
          };
          samples.push(performance.now() - batchStart);
          processed += batch.recordIds.length;
          if (batch.complete) break;
          await delay(
            Math.max(
              0,
              batch.recordIds.length / 3 - (performance.now() - batchStart),
            ),
          );
          if (performance.now() - batchStart < 250)
            batchSize = Math.min(maximumBatchSize, batchSize + 50);
          if (processed - lastReported >= 10000) {
            lastReported = processed;
            Object.assign(report, {
              processed,
              retries,
              scan,
              elapsedSeconds: (performance.now() - startedAt) / 1000,
              rowsPerSecond:
                processed / ((performance.now() - startedAt) / 1000),
            });
            save();
          }
        } catch (error) {
          await client.query('ROLLBACK');
          if (
            error instanceof Error &&
            'code' in error &&
            error.code === '57014' &&
            batchSize > 1
          ) {
            batchSize = Math.max(1, Math.floor(batchSize / 2));
            retries++;
            continue;
          }
          throw error;
        }
      }
    } finally {
      reading = false;
      await readWork;
      await reader.end();
      report.readErrors = readErrors;
    }
    if (target >= 10000000) {
      await client.query("SET statement_timeout = '60s'");
      report.verified = (
        await client.query(
          'SELECT count(*)::int AS total, count(*) FILTER (WHERE cardinality("readableByAccessGroupIds") > 0)::int AS projected FROM compiler_benchmark.company',
        )
      ).rows[0];
      expect(report.verified).toEqual({ total: 10000000, projected: 10000000 });
      expect(scan.blockCursor).toBe(scan.blockLimit);
    }
    readSamples.sort((a, b) => a - b);
    report.walBytes = (
      await client.query(
        'SELECT pg_wal_lsn_diff(pg_current_wal_lsn(), $1)::text AS bytes',
        [walBefore],
      )
    ).rows[0].bytes;
    report.relationBytesBefore = relationBytesBefore;
    report.relationBytesAfter = (
      await client.query(
        "SELECT pg_total_relation_size('compiler_benchmark.company') AS bytes",
      )
    ).rows[0].bytes;
    report.reads = {
      maximumMs: readSamples[readSamples.length - 1],
      samples: readSamples.length,
      errors: readErrors,
      p99Ms: readSamples[Math.floor(readSamples.length * 0.99)],
    };
    samples.sort((a, b) => a - b);
    Object.assign(report, {
      processed,
      scan,
      retries,
      rowsPerSecond: processed / ((performance.now() - startedAt) / 1000),
      elapsedSeconds: (performance.now() - startedAt) / 1000,
      batches: samples.length,
      maximumBatchMs: samples[samples.length - 1],
      totalBatchMs: samples.reduce((total, sample) => total + sample, 0),
      p50BatchMs: samples[Math.floor(samples.length * 0.5)],
      p99BatchMs: samples[Math.floor(samples.length * 0.99)],
      finishedAt: new Date().toISOString(),
    });
    save();
  } catch (error) {
    report.error = String(error);
    save();
    throw error;
  } finally {
    await client.end();
  }
}
(process.env.PERMISSION_BENCHMARK === '1' ? it : it.skip)(
  'benchmarks the production projector on ten million business records',
  async () => {
    jest.useRealTimers();
    await main();
  },
  90 * 60 * 1000,
);
