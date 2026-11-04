import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

const TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-64aa-4b6f-b003-9c74b97cee20';

// Dropped one release after 2.53 stopped reading isCustom, since 2.52 pods still select it
@RegisteredInstanceCommand('2.54.0', 1793139794914)
export class DropIsCustomFromAgentSkillViewIndexAndAgentChatChannelFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const tableName of [
      'agent',
      'skill',
      'view',
      'indexMetadata',
      'agentChatChannel',
    ]) {
      await queryRunner.query(
        `ALTER TABLE "core"."${tableName}" DROP COLUMN IF EXISTS "isCustom"`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const tableName of ['agent', 'skill', 'agentChatChannel']) {
      await queryRunner.query(
        `ALTER TABLE "core"."${tableName}" ADD COLUMN IF NOT EXISTS "isCustom" boolean NOT NULL DEFAULT false`,
      );
      await queryRunner.query(
        `UPDATE "core"."${tableName}" "entity"
         SET "isCustom" = ("entity"."applicationId" = "workspace"."workspaceCustomApplicationId")
         FROM "core"."workspace" "workspace"
         WHERE "workspace"."id" = "entity"."workspaceId"`,
      );
    }

    await queryRunner.query(
      'ALTER TABLE "core"."view" ADD COLUMN IF NOT EXISTS "isCustom" boolean NOT NULL DEFAULT false',
    );
    await queryRunner.query(
      `UPDATE "core"."view" "view"
       SET "isCustom" = ("view"."applicationId" <> "standardApplication"."id")
       FROM "core"."application" "standardApplication"
       WHERE "standardApplication"."workspaceId" = "view"."workspaceId"
         AND "standardApplication"."universalIdentifier" = $1`,
      [TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER],
    );

    await queryRunner.query(
      'ALTER TABLE "core"."indexMetadata" ADD COLUMN IF NOT EXISTS "isCustom" boolean NOT NULL DEFAULT false',
    );
    await queryRunner.query(
      `UPDATE "core"."indexMetadata" "indexMetadata"
       SET "isCustom" = ("indexMetadata"."applicationId" = "workspace"."workspaceCustomApplicationId" AND NOT "indexMetadata"."isSystemSideEffect")
       FROM "core"."workspace" "workspace"
       WHERE "workspace"."id" = "indexMetadata"."workspaceId"`,
    );
  }
}
