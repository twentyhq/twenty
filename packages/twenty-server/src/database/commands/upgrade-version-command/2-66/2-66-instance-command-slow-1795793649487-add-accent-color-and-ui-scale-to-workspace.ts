import { type DataSource, type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

@RegisteredInstanceCommand('2.66.0', 1795793649487, { type: 'slow' })
export class AddAccentColorAndUiScaleToWorkspaceSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(_dataSource: DataSource): Promise<void> {}

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "accentColor" character varying NOT NULL DEFAULT 'blue'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "uiScale" character varying NOT NULL DEFAULT 'Normal'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."workspace" DROP COLUMN "uiScale"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."workspace" DROP COLUMN "accentColor"',
    );
  }
}
