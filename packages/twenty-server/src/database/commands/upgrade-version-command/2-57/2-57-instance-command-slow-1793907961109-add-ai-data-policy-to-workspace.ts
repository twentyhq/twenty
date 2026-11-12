import { type DataSource, type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

@RegisteredInstanceCommand('2.57.0', 1793907961109, { type: 'slow' })
export class AddAiDataPolicyToWorkspaceSlowInstanceCommand implements SlowInstanceCommand {
  async runDataMigration(_dataSource: DataSource): Promise<void> {}

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."workspace" ADD "aiDataPolicy" jsonb NOT NULL DEFAULT \'{"requiredDataResidencyRegion":null,"isZeroDataRetentionRequired":false,"isProductImprovementDataSharingEnabled":true}\'',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."workspace" DROP COLUMN "aiDataPolicy"',
    );
  }
}
