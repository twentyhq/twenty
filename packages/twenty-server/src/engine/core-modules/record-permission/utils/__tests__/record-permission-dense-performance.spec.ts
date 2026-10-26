import { Client } from 'pg';
import { writeFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { v4 } from 'uuid';
import {
  RECORD_PERMISSION_ACCESS_COLUMNS,
  RECORD_PERMISSION_ACTIONS,
} from 'twenty-shared/constants';
import { RowLevelPermissionPredicateOperand } from 'twenty-shared/types';
import { createRecordPermissionTestContext } from 'src/engine/core-modules/record-permission/utils/__tests__/record-permission-test-context';
import { resolveRecordPermissionAccessGroups } from 'src/engine/core-modules/record-permission/utils/resolve-record-permission-access-groups.util';
import { recomputeRecordPermissionBatch } from 'src/engine/core-modules/record-permission/utils/recompute-record-permission-batch.util';
import { type SqlCondition } from 'src/engine/twenty-orm/types/row-access-policy.type';
import { type RecordPermissionAuthority } from 'src/engine/core-modules/record-permission/types/record-permission-context.type';

(process.env.PERMISSION_DENSE_BENCHMARK === '1' ? it : it.skip)(
  'measures one thousand overlapping member bindings across all actions',
  async () => {
    jest.useRealTimers();
    const connectionString = process.env.PERMISSION_BENCHMARK_DATABASE_URL;
    if (
      !connectionString ||
      !new URL(connectionString).pathname.includes('permission') ||
      !new URL(connectionString).pathname.includes('bench')
    ) {
      throw new Error('A dedicated permission benchmark database is required');
    }
    const client = new Client({
      connectionString,
      application_name: 'record_permission_dense_benchmark',
    });
    await client.connect();
    const { context, objects, rule, city, memberCity } =
      createRecordPermissionTestContext();
    context.schemaName = 'dense_benchmark_' + v4().replace(/-/g, '');
    context.definition.objects.forEach((object) => {
      object.inheritancePaths = [];
    });
    rule.actions = [...RECORD_PERMISSION_ACTIONS];
    rule.condition = {
      kind: 'predicate',
      fieldUniversalIdentifier: city.universalIdentifier,
      operand: RowLevelPermissionPredicateOperand.CONTAINS,
      value: null,
      memberFieldUniversalIdentifier: memberCity.universalIdentifier,
    };
    const values = Array.from(
      { length: 1000 },
      (_, index) => 'Region-' + index + ';',
    );
    const authorities: RecordPermissionAuthority[] = values.map((value) => ({
      ...context.authorities[0],
      workspaceMember: { id: v4(), city: value } as unknown as NonNullable<
        RecordPermissionAuthority['workspaceMember']
      >,
    }));
    const columns = Object.values(RECORD_PERMISSION_ACCESS_COLUMNS);
    const report: Record<string, unknown> = {
      members: 1000,
      actions: 6,
      records: 100,
      schema: context.schemaName,
      startedAt: new Date().toISOString(),
      cases: [],
    };
    const results: Record<string, unknown>[] = [];
    report.cases = results;
    try {
      const schema = '"' + context.schemaName + '"';
      await client.query(`CREATE SCHEMA ${schema}`);
      await client.query(
        `CREATE TABLE ${schema}.company (id uuid PRIMARY KEY, city text, "deletedAt" timestamptz, ${columns.map((column) => `"${column}" uuid[] NOT NULL DEFAULT '{}'`).join(', ')})`,
      );
      await client.query(
        `CREATE TABLE ${schema}."recordShare" (id uuid PRIMARY KEY, "objectMetadataId" uuid, "recordId" uuid, "principalId" uuid, "accessLevel" text, "deletedAt" timestamptz)`,
      );
      await client.query(
        `CREATE INDEX ON ${schema}."recordShare"("objectMetadataId","recordId","principalId")`,
      );
      const recordIds = Array.from({ length: 100 }, () => v4());
      await client.query(
        `INSERT INTO ${schema}.company(id,city) SELECT unnest($1::uuid[]),$2`,
        [recordIds, values.join('')],
      );
      await client.query(
        `CREATE INDEX ON ${schema}.company USING gin("readableByAccessGroupIds") WITH (fastupdate=off)`,
      );
      await client.query(
        `CREATE TABLE ${schema}."recordPermissionState" ("activeRevisionId" uuid, "candidateRevisionId" uuid); CREATE TABLE ${schema}."recordPermissionAccessGroup" (id uuid PRIMARY KEY, "revisionId" uuid)`,
      );
      await client.query(
        `INSERT INTO ${schema}."recordPermissionState" VALUES($1,NULL)`,
        [context.revisionId],
      );
      await client.query("SET statement_timeout='1500ms'; SET jit=off");
      for (const numberOfRules of [1, 2]) {
        if (numberOfRules === 2)
          context.definition.objects[0].rules.push({
            ...rule,
            universalIdentifier: v4(),
            condition: {
              kind: 'all',
              conditions: [
                rule.condition!,
                {
                  kind: 'predicate',
                  fieldUniversalIdentifier: city.universalIdentifier,
                  operand: RowLevelPermissionPredicateOperand.CONTAINS,
                  value: 'Region-',
                },
              ],
            },
          });
        const groups = authorities.flatMap((authority) =>
          resolveRecordPermissionAccessGroups({
            revisionId: context.revisionId,
            definition: context.definition,
            metadata: context,
            authority,
          }),
        );
        await client.query(
          `INSERT INTO ${schema}."recordPermissionAccessGroup" SELECT (value->>'id')::uuid,$1 FROM jsonb_array_elements($2::jsonb) value ON CONFLICT DO NOTHING`,
          [context.revisionId, JSON.stringify(groups)],
        );
        const started = performance.now();
        const result: Record<string, unknown> = {
          numberOfRules,
          groups: groups.length,
        };
        try {
          let batchSize = recordIds.length;
          let processed = 0;
          let retries = 0;
          let changed = 0;
          const projectionQueries = new Map<string, SqlCondition>();
          while (processed < recordIds.length) {
            try {
              changed += await recomputeRecordPermissionBatch({
                database: {
                  query: async (sql, parameters) =>
                    (await client.query(sql, parameters)).rows,
                },
                context,
                groups,
                objectUniversalIdentifier: objects.company.universalIdentifier,
                recordIds: recordIds.slice(processed, processed + batchSize),
                projectionQueries,
              });
              processed += Math.min(batchSize, recordIds.length - processed);
            } catch (error) {
              if (
                batchSize === 1 ||
                !(error instanceof Error) ||
                !error.message.includes('statement timeout')
              )
                throw error;
              retries++;
              batchSize = Math.max(1, Math.floor(batchSize / 2));
            }
          }
          result.changed = changed;
          result.retries = retries;
          result.finalBatchSize = batchSize;
          result.projectionMs = performance.now() - started;
          const size = (
            await client.query(
              `SELECT ${columns.map((column) => `min(cardinality("${column}")) AS "${column}"`).join(', ')}, avg(pg_column_size(company)) AS "rowBytes" FROM ${schema}.company`,
            )
          ).rows[0];
          result.size = size;
          expect(result.changed).toBe(100);
          for (const column of columns)
            expect(size[column]).toBe(numberOfRules * 1000);
        } catch (error) {
          result.elapsedMs = performance.now() - started;
          result.error = error instanceof Error ? error.message : String(error);
        }
        results.push(result);
      }
      report.finishedAt = new Date().toISOString();
      writeFileSync(
        process.env.PERMISSION_DENSE_BENCHMARK_REPORT ??
          '/tmp/permission-dense-benchmark.json',
        JSON.stringify(report, null, 2),
      );
      expect(results.every((result) => !result.error)).toBe(true);
    } finally {
      await client.end();
    }
  },
  120000,
);
