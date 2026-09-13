import { type DataSource, type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

const LEGACY_COLUMN_NAME = 'readabilityParentFieldUniversalIdentifiers';

// The pre-`inheritance` shape was a flat uuid array of parent relation fields
// carrying OR semantics, so every entry becomes one branch of an ANY policy.
// Deployments that never carried that column have nothing to migrate; the
// workspace command that follows lifts the morph variants to their morph group.
@RegisteredInstanceCommand('2.41.0', 1789153800001, { type: 'slow' })
export class MigrateLegacyReadabilityParentFieldsSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    const legacyColumns = await dataSource.query(
      `SELECT 1
       FROM information_schema.columns
       WHERE table_schema = 'core'
         AND table_name = 'objectMetadata'
         AND column_name = $1`,
      [LEGACY_COLUMN_NAME],
    );

    if (legacyColumns.length === 0) {
      return;
    }

    await dataSource.query(`
      UPDATE "core"."objectMetadata"
      SET "inheritance" = jsonb_build_object(
        'match', 'ANY',
        'through', (
          SELECT jsonb_agg(
            jsonb_build_object(
              'kind', 'FIELD',
              'fieldUniversalIdentifier', "legacyIdentifier"
            )
          )
          FROM unnest("${LEGACY_COLUMN_NAME}") AS "legacyIdentifier"
        )
      )
      WHERE "inheritance" IS NULL
        AND "${LEGACY_COLUMN_NAME}" IS NOT NULL
        AND array_length("${LEGACY_COLUMN_NAME}", 1) > 0
    `);

    await dataSource.query(
      `ALTER TABLE "core"."objectMetadata" DROP COLUMN "${LEGACY_COLUMN_NAME}"`,
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {}

  // The paired fast command's down drops the column; nothing to undo here.
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
