import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

// Mirrors APPLICATION_UNIVERSAL_IDENTIFIER in
// packages/twenty-apps/public/people-data-labs/src/constants/universal-identifiers.ts
const PEOPLE_DATA_LABS_APPLICATION_UNIVERSAL_IDENTIFIER =
  '4a1178c1-3535-4a47-b592-231d3216b36f';

// Mirrors the serverVariables key in
// packages/twenty-apps/public/people-data-labs/src/application-config.ts,
// which declares RENAMED_APP_KEY as of app version 1.0.11
const LEGACY_APP_KEY = 'PDL_API_KEY';
const RENAMED_APP_KEY = 'PEOPLE_DATA_LABS_APP_API_KEY';

const LEGACY_ENGINE_KEY = 'PEOPLE_DATA_LABS_API_KEY';
const RENAMED_ENGINE_KEY = 'PEOPLE_DATA_LABS_ENGINE_API_KEY';

type RenameQuery = { sql: string; parameters: string[] };

// The app's serverVariable lives on the people-data-labs application
// registration. An unfilled row already holding the target key would collide
// with the (key, applicationRegistrationId) unique index, so drop it before
// renaming; a filled one wins and the rename is skipped.
const buildApplicationVariableRenameQueries = (
  fromKey: string,
  toKey: string,
): RenameQuery[] => [
  {
    sql: `DELETE FROM "core"."applicationRegistrationVariable" AS target
          USING "core"."applicationRegistration" AS registration
          WHERE target."applicationRegistrationId" = registration."id"
            AND registration."universalIdentifier" = $1
            AND target."key" = $2
            AND target."encryptedValue" = ''
            AND EXISTS (
              SELECT 1
              FROM "core"."applicationRegistrationVariable" AS source
              WHERE source."applicationRegistrationId" = target."applicationRegistrationId"
                AND source."key" = $3
            )`,
    parameters: [
      PEOPLE_DATA_LABS_APPLICATION_UNIVERSAL_IDENTIFIER,
      toKey,
      fromKey,
    ],
  },
  {
    sql: `UPDATE "core"."applicationRegistrationVariable" AS target
          SET "key" = $2
          FROM "core"."applicationRegistration" AS registration
          WHERE target."applicationRegistrationId" = registration."id"
            AND registration."universalIdentifier" = $1
            AND target."key" = $3
            AND NOT EXISTS (
              SELECT 1
              FROM "core"."applicationRegistrationVariable" AS conflicting
              WHERE conflicting."applicationRegistrationId" = target."applicationRegistrationId"
                AND conflicting."key" = $2
            )`,
    parameters: [
      PEOPLE_DATA_LABS_APPLICATION_UNIVERSAL_IDENTIFIER,
      toKey,
      fromKey,
    ],
  },
];

// The engine key is a ConfigVariables property, so a value set from the admin
// panel is persisted in keyValuePair under the old name and would be silently
// orphaned by the rename, stopping company enrichment. Env-set values are not
// affected and self-hosters must rename those themselves.
const buildConfigVariableRenameQueries = (
  fromKey: string,
  toKey: string,
): RenameQuery[] => [
  {
    sql: `UPDATE "core"."keyValuePair" AS target
          SET "key" = $2
          WHERE target."key" = $1
            AND target."type" = 'CONFIG_VARIABLE'
            AND NOT EXISTS (
              SELECT 1
              FROM "core"."keyValuePair" AS conflicting
              WHERE conflicting."key" = $2
                AND conflicting."type" = 'CONFIG_VARIABLE'
                AND conflicting."userId" IS NOT DISTINCT FROM target."userId"
                AND conflicting."workspaceId" IS NOT DISTINCT FROM target."workspaceId"
                AND conflicting."applicationId" IS NOT DISTINCT FROM target."applicationId"
            )`,
    parameters: [fromKey, toKey],
  },
];

// people-data-labs 1.0.11 renames its serverVariable. syncVariableSchemas keeps
// stale rows that still hold a value, so the encrypted value survives the manifest
// sync until this carries it over to the new key. The same pass renames the engine
// config variable's keyValuePair row.
@RegisteredInstanceCommand('2.28.0', 1785836761026, { type: 'slow' })
export class RenamePeopleDataLabsApiKeysSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await this.runQueries(
      (sql, parameters) => dataSource.query(sql, parameters),
      [
        ...buildApplicationVariableRenameQueries(
          LEGACY_APP_KEY,
          RENAMED_APP_KEY,
        ),
        ...buildConfigVariableRenameQueries(
          LEGACY_ENGINE_KEY,
          RENAMED_ENGINE_KEY,
        ),
      ],
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {}

  public async down(queryRunner: QueryRunner): Promise<void> {
    await this.runQueries(
      (sql, parameters) => queryRunner.query(sql, parameters),
      [
        ...buildApplicationVariableRenameQueries(
          RENAMED_APP_KEY,
          LEGACY_APP_KEY,
        ),
        ...buildConfigVariableRenameQueries(
          RENAMED_ENGINE_KEY,
          LEGACY_ENGINE_KEY,
        ),
      ],
    );
  }

  private async runQueries(
    runQuery: (sql: string, parameters: string[]) => Promise<unknown>,
    queries: RenameQuery[],
  ): Promise<void> {
    for (const { sql, parameters } of queries) {
      await runQuery(sql, parameters);
    }
  }
}
