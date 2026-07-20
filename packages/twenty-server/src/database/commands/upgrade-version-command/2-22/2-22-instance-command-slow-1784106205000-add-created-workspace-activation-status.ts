import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

@RegisteredInstanceCommand('2.22.0', 1784106205000, { type: 'slow' })
export class AddCreatedWorkspaceActivationStatusSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(_dataSource: DataSource): Promise<void> {
  }

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.swapActivationStatusEnum(queryRunner, {
      enumValues:
        "'ONGOING_CREATION', 'PENDING_CREATION', 'CREATED', 'ACTIVE', 'INACTIVE', 'SUSPENDED'",
      castExpression: '"activationStatus"::"text"',
    });
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await this.swapActivationStatusEnum(queryRunner, {
      enumValues:
        "'ONGOING_CREATION', 'PENDING_CREATION', 'ACTIVE', 'INACTIVE', 'SUSPENDED'",
      castExpression: `CASE WHEN "activationStatus"::"text" = 'CREATED' THEN 'ACTIVE' ELSE "activationStatus"::"text" END`,
    });
  }

  private async swapActivationStatusEnum(
    queryRunner: QueryRunner,
    {
      enumValues,
      castExpression,
    }: { enumValues: string; castExpression: string },
  ): Promise<void> {
    const checkConstraints: { conname: string; definition: string }[] =
      await queryRunner.query(
        `SELECT conname, pg_get_constraintdef(oid) AS definition
         FROM pg_constraint
         WHERE conrelid = 'core.workspace'::regclass
           AND contype = 'c'
           AND pg_get_constraintdef(oid) ILIKE '%activationStatus%'`,
      );

    for (const { conname } of checkConstraints) {
      await queryRunner.query(
        `ALTER TABLE "core"."workspace" DROP CONSTRAINT "${conname}"`,
      );
    }

    await queryRunner.query(
      `ALTER TYPE "core"."workspace_activationStatus_enum" RENAME TO "workspace_activationStatus_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."workspace_activationStatus_enum" AS ENUM(${enumValues})`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "activationStatus" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "activationStatus" TYPE "core"."workspace_activationStatus_enum" USING (${castExpression})::"core"."workspace_activationStatus_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ALTER COLUMN "activationStatus" SET DEFAULT 'INACTIVE'`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."workspace_activationStatus_enum_old"`,
    );

    for (const { conname, definition } of checkConstraints) {
      await queryRunner.query(
        `ALTER TABLE "core"."workspace" ADD CONSTRAINT "${conname}" ${definition}`,
      );
    }
  }
}
