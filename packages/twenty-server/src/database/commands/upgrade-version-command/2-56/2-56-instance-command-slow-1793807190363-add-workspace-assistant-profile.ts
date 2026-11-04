import { type DataSource, type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

@RegisteredInstanceCommand('2.56.0', 1793807190363, { type: 'slow' })
export class AddWorkspaceAssistantProfileSlowInstanceCommand implements SlowInstanceCommand {
  async runDataMigration(_dataSource: DataSource): Promise<void> {}

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."workspace" ADD "aiChatAssistantDisplayName" character varying(64) NOT NULL DEFAULT \'Ada\'',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."workspace" ADD "aiChatAssistantAvatarShape" character varying NOT NULL DEFAULT \'circle\'',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."workspace" ADD "aiChatAssistantAvatarColor" character varying NOT NULL DEFAULT \'blue\'',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."workspace" ADD "aiChatAssistantAvatarFace" character varying NOT NULL DEFAULT \'default\'',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."workspace" ADD "isAiChatAssistantAvatarAnimated" boolean NOT NULL DEFAULT true',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."workspace" DROP COLUMN "isAiChatAssistantAvatarAnimated"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."workspace" DROP COLUMN "aiChatAssistantAvatarFace"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."workspace" DROP COLUMN "aiChatAssistantAvatarColor"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."workspace" DROP COLUMN "aiChatAssistantAvatarShape"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."workspace" DROP COLUMN "aiChatAssistantDisplayName"',
    );
  }
}
