import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

// packages/twenty-apps/public/people-data-labs APPLICATION_UNIVERSAL_IDENTIFIER
const PEOPLE_DATA_LABS_APPLICATION_UNIVERSAL_IDENTIFIER =
  '4a1178c1-3535-4a47-b592-231d3216b36f';

const LEGACY_KEY = 'PDL_API_KEY';
const RENAMED_KEY = 'PEOPLE_DATA_LABS_APP_API_KEY';

// An unfilled row already holding the target key would collide with the
// (key, applicationRegistrationId) unique index, so drop it before renaming.
// A filled one wins and the rename below is skipped.
const buildRenameQueries = (
  fromKey: string,
  toKey: string,
): { sql: string; parameters: unknown[] }[] => [
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

// people-data-labs 1.0.11 renames its serverVariable, and syncVariableSchemas
// deletes any stored variable whose key the manifest no longer declares. Carry
// the encrypted value over to the new key first so admins keep their configured
// People Data Labs key. The app pins engines.twenty >=2.28.0, so no instance can
// pull the renaming manifest before this runs.
@RegisteredInstanceCommand('2.28.0', 1785836761026, { type: 'slow' })
export class RenamePeopleDataLabsAppApiKeyVariableSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    for (const { sql, parameters } of buildRenameQueries(
      LEGACY_KEY,
      RENAMED_KEY,
    )) {
      await dataSource.query(sql, parameters);
    }
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {}

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const { sql, parameters } of buildRenameQueries(
      RENAMED_KEY,
      LEGACY_KEY,
    )) {
      await queryRunner.query(sql, parameters);
    }
  }
}
