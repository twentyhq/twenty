import { DataSource, type QueryRunner } from 'typeorm';

import { MigrateWorkspaceModelsToTiersSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-40/2-40-instance-command-slow-1789000000001-migrate-workspace-models-to-tiers';

const buildFakeRunner = ({
  hasLegacyColumns,
}: {
  hasLegacyColumns: boolean;
}): {
  dataSource: DataSource;
  queryRunner: QueryRunner;
  queries: string[];
} => {
  const queries: string[] = [];

  const query = jest.fn().mockImplementation(async (sql: string) => {
    queries.push(sql);

    if (sql.includes('information_schema.columns')) {
      return hasLegacyColumns ? [{ '?column?': 1 }] : [];
    }

    return [];
  });
  const dataSource = new DataSource({ type: 'postgres' });
  const queryRunner = dataSource.createQueryRunner();

  dataSource.query = query;
  queryRunner.query = query;

  return { dataSource, queryRunner, queries };
};

describe('MigrateWorkspaceModelsToTiersSlowInstanceCommand', () => {
  it('is a no-op once the legacy columns are gone', async () => {
    const { dataSource, queryRunner, queries } = buildFakeRunner({
      hasLegacyColumns: false,
    });
    const command = new MigrateWorkspaceModelsToTiersSlowInstanceCommand();

    await command.runDataMigration(dataSource);
    await command.up(queryRunner);

    expect(queries.every((sql) => sql.includes('information_schema'))).toBe(
      true,
    );
  });

  it('pins the concrete models a workspace had chosen and turns automatic selection off', async () => {
    const { dataSource, queries } = buildFakeRunner({ hasLegacyColumns: true });

    await new MigrateWorkspaceModelsToTiersSlowInstanceCommand().runDataMigration(
      dataSource,
    );

    const workspaceUpdate = queries.find((sql) =>
      sql.includes('UPDATE "core"."workspace"'),
    );

    expect(workspaceUpdate).toContain('"isAutoModelSelectionEnabled" = false');
    expect(workspaceUpdate).toContain(`"smartModel" LIKE '%/%'`);
    expect(workspaceUpdate).toContain(`"fastModel" LIKE '%/%'`);
    expect(workspaceUpdate).toContain(`"aiModelIdByTier" = '{}'::jsonb`);
  });

  it('keeps a workspace that picked its smart model on the Smart tier', async () => {
    const { dataSource, queries } = buildFakeRunner({ hasLegacyColumns: true });

    await new MigrateWorkspaceModelsToTiersSlowInstanceCommand().runDataMigration(
      dataSource,
    );

    const workspaceUpdate = queries.find((sql) =>
      sql.includes('UPDATE "core"."workspace"'),
    );

    expect(workspaceUpdate).toContain(
      `"aiChatModelTier" = CASE WHEN "smartModel" LIKE '%/%' THEN 'smart'`,
    );
    expect(workspaceUpdate).toContain(
      `"aiAgentModelTier" = CASE WHEN "smartModel" LIKE '%/%' THEN 'smart'`,
    );
  });

  it('moves agents on the old smart default or the legacy auto id onto the workspace tier', async () => {
    const { dataSource, queries } = buildFakeRunner({ hasLegacyColumns: true });

    await new MigrateWorkspaceModelsToTiersSlowInstanceCommand().runDataMigration(
      dataSource,
    );

    expect(queries).toContainEqual(
      expect.stringContaining(
        `SET "modelId" = 'workspace-default-model' WHERE "modelId" IN ('default-smart-model', 'auto')`,
      ),
    );
  });

  it('drops every legacy column in the schema step', async () => {
    const { queryRunner, queries } = buildFakeRunner({
      hasLegacyColumns: true,
    });

    await new MigrateWorkspaceModelsToTiersSlowInstanceCommand().up(
      queryRunner,
    );

    const dropStatement = queries.find((sql) => sql.includes('DROP COLUMN'));

    for (const column of [
      'fastModel',
      'smartModel',
      'enabledAiModelIds',
      'useRecommendedModels',
      'routerModel',
    ]) {
      expect(dropStatement).toContain(`DROP COLUMN "${column}"`);
    }
  });
});
