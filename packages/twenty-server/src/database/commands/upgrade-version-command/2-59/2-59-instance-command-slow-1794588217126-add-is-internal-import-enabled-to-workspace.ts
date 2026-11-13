import { type DataSource, type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

@RegisteredInstanceCommand('2.59.0', 1794588217126, { type: 'slow' })
export class AddIsInternalImportEnabledToWorkspaceSlowInstanceCommand implements SlowInstanceCommand {
  async runDataMigration(_dataSource: DataSource): Promise<void> {}

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."workspace" ADD "isInternalImportEnabled" boolean NOT NULL DEFAULT false',
    );
    await queryRunner.query(
      'UPDATE "core"."workspace" SET "isInternalImportEnabled" = "isInternalMessagesImportEnabled" WHERE "isInternalMessagesImportEnabled" = true',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."workspace" DROP COLUMN "isInternalImportEnabled"',
    );
  }
}
