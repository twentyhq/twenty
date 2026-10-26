import { Client } from 'pg';
import { writeFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { v4 } from 'uuid';
import { RowLevelPermissionPredicateOperand } from 'twenty-shared/types';
import { createRecordPermissionTestContext } from 'src/engine/core-modules/record-permission/utils/__tests__/record-permission-test-context';
import { resolveRecordPermissionAccessGroups } from 'src/engine/core-modules/record-permission/utils/resolve-record-permission-access-groups.util';
import { recomputeRecordPermissionBatch } from 'src/engine/core-modules/record-permission/utils/recompute-record-permission-batch.util';
import { type RecordPermissionAuthority } from 'src/engine/core-modules/record-permission/types/record-permission-context.type';

(process.env.PERMISSION_DYNAMIC_BENCHMARK === '1' ? it : it.skip)(
  'measures one thousand dynamic member bindings',
  async () => {
    jest.useRealTimers();
    const connectionString = process.env.PERMISSION_BENCHMARK_DATABASE_URL;
    if (
      !connectionString ||
      !new URL(connectionString).pathname.includes('permission') ||
      !new URL(connectionString).pathname.includes('bench')
    )
      throw new Error('A dedicated benchmark database is required');
    const client = new Client({ connectionString });
    await client.connect();
    const { context, objects, rule, city, memberCity } =
      createRecordPermissionTestContext();
    context.schemaName = 'inheritance_benchmark';
    rule.actions = ['read'];
    rule.condition = {
      kind: 'predicate',
      fieldUniversalIdentifier: city.universalIdentifier,
      operand: RowLevelPermissionPredicateOperand.CONTAINS,
      value: null,
      memberFieldUniversalIdentifier: memberCity.universalIdentifier,
    };
    try {
      const started = performance.now();
      const groups = Array.from({ length: 1000 }, (_, index) =>
        resolveRecordPermissionAccessGroups({
          revisionId: context.revisionId,
          definition: context.definition,
          metadata: context,
          authority: {
            ...context.authorities[0],
            workspaceMember: {
              id: v4(),
              city: 'City-' + index,
            } as unknown as NonNullable<
              RecordPermissionAuthority['workspaceMember']
            >,
          },
        }),
      ).flat();
      const bindingMs = performance.now() - started;
      const records = (
        await client.query(
          'SELECT id FROM inheritance_benchmark.company LIMIT 100',
        )
      ).rows as { id: string }[];
      await client.query("SET statement_timeout='1500ms'; SET jit=off");
      const projected = performance.now();
      const changed = await recomputeRecordPermissionBatch({
        database: {
          query: async (sql, parameters) =>
            (await client.query(sql, parameters)).rows,
        },
        context,
        groups,
        objectUniversalIdentifier: objects.company.universalIdentifier,
        recordIds: records.map((record) => record.id),
      });
      const report = {
        members: 1000,
        groups: groups.length,
        records: records.length,
        changed,
        bindingMs,
        projectionMs: performance.now() - projected,
        finishedAt: new Date().toISOString(),
      };
      writeFileSync(
        process.env.PERMISSION_DYNAMIC_BENCHMARK_REPORT ??
          '/tmp/permission-dynamic-benchmark.json',
        JSON.stringify(report, null, 2),
      );
      expect(changed).toBe(100);
    } finally {
      await client.end();
    }
  },
  30000,
);
