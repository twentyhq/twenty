import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// Opens the tier columns next to the model columns they replace. Until the
// paired slow command copies each workspace's earlier picks into them and drops
// the old columns, every workspace reads as automatic selection on Fast.
@RegisteredInstanceCommand('2.40.0', 1789000000000)
export class AddAiModelTiersToWorkspaceFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "aiChatModelTier" character varying NOT NULL DEFAULT 'fast'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "aiAgentModelTier" character varying NOT NULL DEFAULT 'fast'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "isAutoModelSelectionEnabled" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "aiModelIdByTier" jsonb NOT NULL DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."agent" ALTER COLUMN "modelId" SET DEFAULT 'workspace-default-model'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."agent" ALTER COLUMN "modelId" SET DEFAULT 'default-smart-model'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "aiModelIdByTier", DROP COLUMN "isAutoModelSelectionEnabled", DROP COLUMN "aiAgentModelTier", DROP COLUMN "aiChatModelTier"`,
    );
  }
}
