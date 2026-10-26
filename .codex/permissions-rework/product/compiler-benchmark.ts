import { Client } from 'pg';
import { performance } from 'node:perf_hooks';
import { writeFileSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';
import { v4 } from 'uuid';
import { createRecordPermissionTestContext } from 'src/engine/core-modules/record-permission/utils/__tests__/record-permission-test-context';
import { recomputeRecordPermissionBatch } from 'src/engine/core-modules/record-permission/utils/recompute-record-permission-batch.util';
import { resolveRecordPermissionAccessGroups } from 'src/engine/core-modules/record-permission/utils/resolve-record-permission-access-groups.util';
import { compileRecordPermission } from 'src/engine/core-modules/record-permission/utils/compile-record-permission.util';
import { compileNamedParameters } from 'src/engine/twenty-orm/sql/utils/compile-named-parameters.util';
import { type SqlCondition } from 'src/engine/twenty-orm/types/row-access-policy.type';

async function main() {
  const fixture = createRecordPermissionTestContext();
  const { context, objects, rule } = fixture;
  context.schemaName = 'compiler_benchmark';
  context.definition.objects.forEach((object) => { object.inheritancePaths = []; });
  rule.condition = null;
  rule.actions = ['receive'];
  const base = resolveRecordPermissionAccessGroups({ revisionId: context.revisionId, definition: context.definition, authority: context.authorities[0], metadata: context })[0];
  const recipients = Array.from({ length: 1000 }, () => ({ principalId: v4(), groupId: v4() }));
  const groups = [base, ...recipients.map(({ principalId, groupId }) => ({ ...base, id: groupId, sharePrincipalIds: [principalId] }))];
  const client = new Client({ database: 'permissions_rework_bench_20261026', host: 'localhost', user: 'charles', application_name: 'record_permission_compiler_benchmark' });
  await client.connect();
  const database = { query: async (sql: string, parameters?: unknown[]) => (await client.query(sql, parameters)).rows };
  const columns = ['readableByAccessGroupIds', 'writableByAccessGroupIds', 'softDeletableByAccessGroupIds', 'destroyableByAccessGroupIds', 'shareableByAccessGroupIds', 'receivableByAccessGroupIds'];
  const report: Record<string, unknown> = { rows: 10000000, members: 1000, shares: 50000, startedAt: new Date().toISOString() };
  const save = () => writeFileSync('.codex/permissions-rework/product/compiler-benchmark-results.json', JSON.stringify(report, null, 2));
  try {
    await client.query('CREATE SCHEMA IF NOT EXISTS compiler_benchmark');
    const existing = (await client.query("SELECT to_regclass('compiler_benchmark.company') AS existing")).rows[0].existing;
    if (!existing) {
      await client.query(`CREATE TABLE compiler_benchmark.company AS SELECT id, name, city, created_at, business_payload, NULL::timestamptz AS "deletedAt", ${columns.map((column) => `'{}'::uuid[] AS "${column}"`).join(', ')} FROM permission_write_record`);
      await client.query('ALTER TABLE compiler_benchmark.company ADD PRIMARY KEY(id)');
      await client.query('CREATE INDEX company_created ON compiler_benchmark.company(created_at, id)');
      await client.query('CREATE INDEX company_city ON compiler_benchmark.company(city, created_at, id)');
      await client.query('CREATE INDEX company_name ON compiler_benchmark.company(name)');
      await client.query('CREATE INDEX company_access ON compiler_benchmark.company USING gin("readableByAccessGroupIds")');
    }
    await client.query('CREATE TABLE IF NOT EXISTS compiler_benchmark."recordShare" (id uuid PRIMARY KEY, "objectMetadataId" uuid, "recordId" uuid, "principalId" uuid, "accessLevel" text, "deletedAt" timestamptz)');
    await client.query('CREATE INDEX IF NOT EXISTS share_record ON compiler_benchmark."recordShare" ("objectMetadataId", "recordId", "principalId")');
    await client.query('CREATE TABLE IF NOT EXISTS compiler_benchmark."recordPermissionState" ("activeRevisionId" uuid, "candidateRevisionId" uuid)');
    await client.query('CREATE TABLE IF NOT EXISTS compiler_benchmark."recordPermissionAccessGroup" (id uuid PRIMARY KEY, "revisionId" uuid)');
    await client.query('TRUNCATE compiler_benchmark."recordShare", compiler_benchmark."recordPermissionState", compiler_benchmark."recordPermissionAccessGroup"');
    await client.query('INSERT INTO compiler_benchmark."recordPermissionState" VALUES ($1,NULL)', [context.revisionId]);
    await client.query('INSERT INTO compiler_benchmark."recordPermissionAccessGroup" SELECT (value->>\'id\')::uuid,$1::uuid FROM jsonb_array_elements($2::jsonb) value', [context.revisionId, JSON.stringify(groups)]);
    await client.query(`INSERT INTO compiler_benchmark."recordShare" SELECT md5(record.id::text || 'share')::uuid, $1::uuid, record.id, ($2::uuid[])[1 + (row_number() OVER () % 1000)::int], 'FULL', NULL FROM (SELECT id FROM compiler_benchmark.company ORDER BY id LIMIT 50000) record`, [objects.company.id, recipients.map((recipient) => recipient.principalId)]);
    await client.query('VACUUM (ANALYZE) compiler_benchmark.company');
    await client.query('ANALYZE compiler_benchmark."recordShare"');
    const projectionQueries = new Map<string, SqlCondition>();
    const target = Number(process.env.PERMISSION_BENCH_ROWS ?? 100000);
    let cursor: string | null = null;
    let processed = 0;
    const samples: number[] = [];
    const startedAt = performance.now();
    await client.query("SET statement_timeout = '1500ms'");
    while (processed < target) {
      const batchStart = performance.now();
      const records = (await client.query('SELECT id FROM compiler_benchmark.company WHERE ($1::uuid IS NULL OR id > $1::uuid) ORDER BY id LIMIT 250', [cursor])).rows;
      if (!records.length) break;
      await recomputeRecordPermissionBatch({ database, context, groups, objectUniversalIdentifier: objects.company.universalIdentifier, recordIds: records.map((record) => record.id), projectionQueries });
      samples.push(performance.now() - batchStart);
      processed += records.length;
      cursor = records[records.length - 1].id;
      await delay(Math.max(0, 250 / 3 - (performance.now() - batchStart)));
      if (processed % 10000 === 0) {
        Object.assign(report, { processed, elapsedSeconds: (performance.now() - startedAt) / 1000, rowsPerSecond: processed / ((performance.now() - startedAt) / 1000) });
        save();
        console.log(JSON.stringify({ processed, elapsedSeconds: report.elapsedSeconds, rowsPerSecond: report.rowsPerSecond }));
      }
    }
    samples.sort((a,b) => a-b);
    Object.assign(report, { processed, elapsedSeconds: (performance.now() - startedAt) / 1000, p50BatchMs: samples[Math.floor(samples.length * .5)], p99BatchMs: samples[Math.floor(samples.length * .99)], finishedAt: new Date().toISOString() });
    save();
  } catch (error) {
    report.error = String(error);
    save();
    throw error;
  } finally { await client.end(); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
