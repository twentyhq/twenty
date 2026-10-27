import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

const appendDisabledActions = (actions: string[]) =>
  `(SELECT jsonb_agg(DISTINCT "action" ORDER BY "action") FROM jsonb_array_elements_text(COALESCE("disabledObjectPermissionActions", '[]'::jsonb) || '${JSON.stringify(actions)}'::jsonb) AS "action")`;

const narrowEnumWithoutApplication = async (
  queryRunner: QueryRunner,
  { table, column, values }: { table: string; column: string; values: string[] },
) => {
  const enumName = `${table}_${column}_enum`;

  await queryRunner.query(
    `ALTER TYPE "core"."${enumName}" RENAME TO "${enumName}_old"`,
  );
  await queryRunner.query(
    `CREATE TYPE "core"."${enumName}" AS ENUM(${values.map((value) => `'${value}'`).join(', ')})`,
  );
  await queryRunner.query(
    `ALTER TABLE "core"."${table}" ALTER COLUMN "${column}" DROP DEFAULT`,
  );
  await queryRunner.query(
    `ALTER TABLE "core"."${table}" ALTER COLUMN "${column}" TYPE "core"."${enumName}" USING "${column}"::"text"::"core"."${enumName}"`,
  );
  await queryRunner.query(
    `ALTER TABLE "core"."${table}" ALTER COLUMN "${column}" SET DEFAULT 'OPEN'`,
  );
  await queryRunner.query(`DROP TYPE "core"."${enumName}_old"`);
};

// APPLICATION access is now expressed by disabledObjectPermissionActions, which the owning application bypasses.
@RegisteredInstanceCommand('2.53.0', 1793129132000, { type: 'slow' })
export class ReplaceApplicationMetadataAccessSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      `UPDATE "core"."objectMetadata"
       SET "writability" = 'OPEN',
           "disabledObjectPermissionActions" = ${appendDisabledActions([
             'canUpdateObjectRecords',
             'canSoftDeleteObjectRecords',
             'canDestroyObjectRecords',
           ])}
       WHERE "writability" = 'APPLICATION'`,
    );
    await dataSource.query(
      `UPDATE "core"."objectMetadata"
       SET "readability" = 'OPEN',
           "disabledObjectPermissionActions" = ${appendDisabledActions([
             'canReadObjectRecords',
           ])}
       WHERE "readability" = 'APPLICATION'`,
    );
    // no object-level equivalent exists for a field, so keep it closed
    await dataSource.query(
      `UPDATE "core"."fieldMetadata" SET "writability" = 'SYSTEM' WHERE "writability" = 'APPLICATION'`,
    );
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await narrowEnumWithoutApplication(queryRunner, {
      table: 'objectMetadata',
      column: 'writability',
      values: ['OPEN', 'SYSTEM'],
    });
    await narrowEnumWithoutApplication(queryRunner, {
      table: 'objectMetadata',
      column: 'readability',
      values: ['OPEN', 'PRIVATE', 'INHERITED', 'SYSTEM'],
    });
    await narrowEnumWithoutApplication(queryRunner, {
      table: 'fieldMetadata',
      column: 'writability',
      values: ['OPEN', 'SYSTEM'],
    });
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await narrowEnumWithoutApplication(queryRunner, {
      table: 'objectMetadata',
      column: 'writability',
      values: ['OPEN', 'APPLICATION', 'SYSTEM'],
    });
    await narrowEnumWithoutApplication(queryRunner, {
      table: 'objectMetadata',
      column: 'readability',
      values: ['OPEN', 'PRIVATE', 'INHERITED', 'APPLICATION', 'SYSTEM'],
    });
    await narrowEnumWithoutApplication(queryRunner, {
      table: 'fieldMetadata',
      column: 'writability',
      values: ['OPEN', 'APPLICATION', 'SYSTEM'],
    });
  }
}
