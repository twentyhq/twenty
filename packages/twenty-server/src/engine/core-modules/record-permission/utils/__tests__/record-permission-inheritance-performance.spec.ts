import { Client } from 'pg';
import { writeFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { setTimeout as delay } from 'node:timers/promises';
import { v4 } from 'uuid';
import { type RecordPermissionScan } from 'src/engine/core-modules/record-permission/types/record-permission-scan.type';
import { type RecordPermissionAuthority } from 'src/engine/core-modules/record-permission/types/record-permission-context.type';
import { createRecordPermissionTestContext } from 'src/engine/core-modules/record-permission/utils/__tests__/record-permission-test-context';
import { compileInheritedRecordShares } from 'src/engine/core-modules/record-permission/utils/compile-inherited-record-shares.util';
import { compileRecordPermission } from 'src/engine/core-modules/record-permission/utils/compile-record-permission.util';
import { recomputeRecordPermissionBatch } from 'src/engine/core-modules/record-permission/utils/recompute-record-permission-batch.util';
import { readRecordPermissionScanBatch } from 'src/engine/core-modules/record-permission/utils/read-record-permission-scan-batch.util';
import { resolveRecordPermissionAccessGroups } from 'src/engine/core-modules/record-permission/utils/resolve-record-permission-access-groups.util';
import { compileNamedParameters } from 'src/engine/twenty-orm/sql/utils/compile-named-parameters.util';
import { type SqlCondition } from 'src/engine/twenty-orm/types/row-access-policy.type';

(process.env.PERMISSION_INHERITANCE_BENCHMARK === '1' ? it : it.skip)(
  'measures fifty thousand shares inherited by thirty records over three fields',
  async () => {
    jest.useRealTimers();
    const connectionString = process.env.PERMISSION_BENCHMARK_DATABASE_URL;
    if (
      !connectionString ||
      !new URL(connectionString).pathname.includes('permission') ||
      !new URL(connectionString).pathname.includes('bench')
    )
      throw new Error('A dedicated permission benchmark database is required');
    const reportPath =
      process.env.PERMISSION_INHERITANCE_BENCHMARK_REPORT ??
      '/tmp/record-permission-inheritance-benchmark.json';
    const report: Record<string, unknown> = {
      shares: 50000,
      descendantsPerShare: 30,
      descendants: 1500000,
      members: 1000,
      startedAt: new Date().toISOString(),
    };
    const save = () =>
      writeFileSync(reportPath, JSON.stringify(report, null, 2));
    const client = new Client({
      connectionString,
      application_name: 'record_permission_inheritance_benchmark',
    });
    await client.connect();
    const database = {
      query: async (sql: string, parameters?: unknown[]) =>
        (await client.query(sql, parameters)).rows,
    };
    const fixture = createRecordPermissionTestContext();
    const { context, objects, rule } = fixture;
    context.schemaName = 'inheritance_benchmark';
    rule.condition = null;
    rule.actions = ['receive'];
    const authorities: RecordPermissionAuthority[] = Array.from(
      { length: 1000 },
      (_, index) => ({
        ...context.authorities[0],
        workspaceMember: {
          id: v4(),
          city: 'City-' + index,
        } as unknown as NonNullable<
          RecordPermissionAuthority['workspaceMember']
        >,
      }),
    );
    context.authorities = [authorities[0]];
    const groups = [
      ...new Map(
        authorities
          .flatMap((authority) =>
            resolveRecordPermissionAccessGroups({
              revisionId: context.revisionId,
              definition: context.definition,
              metadata: context,
              authority,
            }),
          )
          .filter(
            (group) =>
              group.sourceObjectUniversalIdentifier ===
              objects.company.universalIdentifier,
          )
          .map((group) => [group.id, group]),
      ).values(),
    ];
    const columns = [
      'readableByAccessGroupIds',
      'writableByAccessGroupIds',
      'softDeletableByAccessGroupIds',
      'destroyableByAccessGroupIds',
      'shareableByAccessGroupIds',
      'receivableByAccessGroupIds',
    ];
    try {
      await client.query(
        'CREATE SCHEMA IF NOT EXISTS core; CREATE TABLE IF NOT EXISTS core."recordPermissionRevision" (id uuid PRIMARY KEY, status text)',
      );
      await client.query('CREATE SCHEMA inheritance_benchmark');
      await client.query(
        `CREATE TABLE inheritance_benchmark.company AS SELECT md5(value::text || ':company')::uuid AS id, 'City-' || (value % 1000) AS city, NULL::timestamptz AS "deletedAt", ${columns.map((column) => `'{}'::uuid[] AS "${column}"`).join(', ')} FROM generate_series(1,50000) value`,
      );
      await client.query(
        `CREATE TABLE inheritance_benchmark.person AS SELECT md5(value::text || ':person')::uuid AS id, md5(value::text || ':company')::uuid AS "companyId", NULL::timestamptz AS "deletedAt" FROM generate_series(1,50000) value`,
      );
      await client.query(
        `CREATE TABLE inheritance_benchmark.message AS SELECT md5(value::text || ':message')::uuid AS id, value AS position, NULL::timestamptz AS "deletedAt", repeat('x',128) AS payload, ${columns.map((column) => `'{}'::uuid[] AS "${column}"`).join(', ')} FROM generate_series(1,1500000) value`,
      );
      await client.query(
        `CREATE TABLE inheritance_benchmark."messageParticipant" AS SELECT md5(value::text || ':participant')::uuid AS id, md5((((value-1)/30)+1)::text || ':person')::uuid AS "personId", md5(value::text || ':message')::uuid AS "messageId", NULL::timestamptz AS "deletedAt" FROM generate_series(1,1500000) value`,
      );
      for (const table of [
        'company',
        'person',
        'message',
        'messageParticipant',
      ]) {
        await client.query(
          `ALTER TABLE inheritance_benchmark."${table}" ADD PRIMARY KEY (id)`,
        );
        await client.query(`ANALYZE inheritance_benchmark."${table}"`);
      }
      await client.query(
        'CREATE INDEX ON inheritance_benchmark.person("companyId",id); CREATE INDEX ON inheritance_benchmark."messageParticipant"("personId",id); CREATE INDEX ON inheritance_benchmark."messageParticipant"("messageId",id); CREATE INDEX ON inheritance_benchmark.message(position,id); CREATE INDEX ON inheritance_benchmark.message USING gin("readableByAccessGroupIds") WITH (fastupdate=off)',
      );
      await client.query(
        `CREATE TABLE inheritance_benchmark."recordShare" AS SELECT md5(value::text || ':share')::uuid AS id, $1::uuid AS "objectMetadataId", md5(value::text || ':company')::uuid AS "recordId", ($2::uuid[])[1+(value%1000)] AS "principalId", 'WORKSPACE_MEMBER'::text AS "principalType", 'FULL'::text AS "accessLevel", 'MANUAL'::text AS "rowCause", NULL::timestamptz AS "deletedAt" FROM generate_series(1,50000) value`,
        [
          objects.company.id,
          authorities.map((authority) => authority.workspaceMember!.id),
        ],
      );
      await client.query(
        'ALTER TABLE inheritance_benchmark."recordShare" ADD PRIMARY KEY(id); CREATE INDEX ON inheritance_benchmark."recordShare"("objectMetadataId","recordId","principalId"); ANALYZE inheritance_benchmark."recordShare"',
      );
      await client.query(
        'CREATE TABLE inheritance_benchmark."recordPermissionState" ("activeRevisionId" uuid, "candidateRevisionId" uuid); CREATE TABLE inheritance_benchmark."recordPermissionAccessGroup" (id uuid PRIMARY KEY, "revisionId" uuid)',
      );
      await client.query(
        'INSERT INTO inheritance_benchmark."recordPermissionState" VALUES ($1,NULL)',
        [context.revisionId],
      );
      await client.query(
        'INSERT INTO inheritance_benchmark."recordPermissionAccessGroup" SELECT (value->>\'id\')::uuid,$1::uuid FROM jsonb_array_elements($2::jsonb) value',
        [context.revisionId, JSON.stringify(groups)],
      );
      await client.query(
        `INSERT INTO core."recordPermissionRevision" VALUES ($1,'active')`,
        [context.revisionId],
      );
      const sampleIds = (
        await client.query(
          "SELECT md5((30000 * company_number - sample_offset)::text || ':message')::uuid AS id FROM generate_series(1,50) company_number CROSS JOIN generate_series(0,1) sample_offset",
        )
      ).rows as { id: string }[];
      const live = compileRecordPermission({
        context,
        action: 'read',
        objectUniversalIdentifier: objects.message.universalIdentifier,
        tableAlias: 'record',
        strategy: 'live',
      });
      const timings: Record<string, number[]> = {
        livePoint: [],
        inheritedShares: [],
      };
      await client.query("SET statement_timeout='250ms'; SET jit=off");
      for (const { id } of sampleIds) {
        const point = compileNamedParameters(
          `SELECT id FROM inheritance_benchmark.message record WHERE id=:targetId AND (${live.sql})`,
          { ...live.parameters, targetId: id },
        );
        let started = performance.now();
        const pointResult = await client.query(point);
        timings.livePoint.push(performance.now() - started);
        expect(pointResult.rows).toHaveLength(1);
        const inherited = compileInheritedRecordShares({
          context,
          targetObjectUniversalIdentifier: objects.message.universalIdentifier,
          recordId: id,
        })!;
        started = performance.now();
        const result = await client.query(
          compileNamedParameters(inherited.sql, inherited.parameters),
        );
        timings.inheritedShares.push(performance.now() - started);
        expect(result.rows).toHaveLength(1);
      }
      report.reads = Object.fromEntries(
        Object.entries(timings).map(([name, samples]) => {
          samples.sort((a, b) => a - b);
          return [
            name,
            { p50Ms: samples[50], p99Ms: samples[99], samples: samples.length },
          ];
        }),
      );
      save();
      await client.query("SET statement_timeout='1500ms'");
      const started = performance.now();
      let processed = 0;
      let changed = 0;
      let retries = 0;
      let complete = false;
      let batchSize = 1000;
      let lastReported = 0;
      let scan: RecordPermissionScan = {
        blockCursor: 0,
        blockLimit: null,
        relationFileNode: null,
      };
      const projectionQueries = new Map<string, SqlCondition>();
      while (!complete) {
        const batchStarted = performance.now();
        try {
          await client.query('BEGIN');
          const batch = await readRecordPermissionScanBatch({
            database,
            schemaName: context.schemaName,
            tableName: 'message',
            scan,
            batchSize,
          });
          changed += await recomputeRecordPermissionBatch({
            database,
            context,
            groups,
            objectUniversalIdentifier: objects.message.universalIdentifier,
            recordIds: batch.recordIds,
            projectionQueries,
          });
          await client.query('COMMIT');
          scan = {
            blockCursor: batch.blockCursor,
            blockLimit: batch.blockLimit,
            relationFileNode: batch.relationFileNode,
          };
          complete = batch.complete;
          processed += batch.recordIds.length;
          await delay(
            Math.max(
              0,
              batch.recordIds.length / 3 - (performance.now() - batchStarted),
            ),
          );
          if (performance.now() - batchStarted < 400)
            batchSize = Math.min(1000, batchSize + 25);
          if (processed - lastReported > 10000) {
            lastReported = processed;
            Object.assign(report, {
              processed,
              changed,
              scan,
              retries,
              elapsedSeconds: (performance.now() - started) / 1000,
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
      Object.assign(report, {
        processed,
        changed,
        scan,
        retries,
        elapsedSeconds: (performance.now() - started) / 1000,
      });
      await client.query("SET statement_timeout='60s'");
      const [verified] = (
        await client.query(
          'SELECT count(*)::int AS total, count(*) FILTER (WHERE cardinality("readableByAccessGroupIds")>0)::int AS projected FROM inheritance_benchmark.message',
        )
      ).rows;
      report.verified = verified;
      expect(verified).toEqual({ total: 1500000, projected: 1500000 });
      report.finishedAt = new Date().toISOString();
      save();
    } catch (error) {
      report.error = String(error);
      save();
      throw error;
    } finally {
      await client.end();
    }
  },
  60 * 60 * 1000,
);
