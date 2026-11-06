import { type DataSource, type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

@RegisteredInstanceCommand('2.56.0', 1793810534548, { type: 'slow' })
export class AddWorkspaceAssistantProfileSlowInstanceCommand implements SlowInstanceCommand {
  async runDataMigration(_dataSource: DataSource): Promise<void> {}

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."workspace" ADD "aiChatAssistantProfile" jsonb NOT NULL DEFAULT \'{"displayName":"Ada","avatarShape":"circle","avatarColor":"blue","avatarFace":"default","isAvatarAnimated":true}\'',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."workspace" DROP COLUMN "aiChatAssistantProfile"',
    );
  }
}
