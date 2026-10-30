import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.54.0', 1793360021964)
export class AddWebhookIdToRoleTargetFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."roleTarget" ADD "webhookId" uuid');
    await queryRunner.query('ALTER TABLE "core"."roleTarget" DROP CONSTRAINT "CHK_role_target_single_entity"');
    await queryRunner.query('ALTER TABLE "core"."roleTarget" ADD CONSTRAINT "CHK_role_target_single_entity" CHECK ((("agentId" IS NOT NULL)::int + ("userWorkspaceId" IS NOT NULL)::int + ("apiKeyId" IS NOT NULL)::int + ("webhookId" IS NOT NULL)::int) = 1)');
    await queryRunner.query('CREATE INDEX "IDX_ROLE_TARGET_WEBHOOK_ID" ON "core"."roleTarget" ("webhookId") ');
    await queryRunner.query('ALTER TABLE "core"."roleTarget" ADD CONSTRAINT "IDX_ROLE_TARGET_UNIQUE_WEBHOOK" UNIQUE ("workspaceId", "webhookId")');
    await queryRunner.query('ALTER TABLE "core"."roleTarget" ADD CONSTRAINT "FK_e3c4f91f74bc6092c81b63edf39" FOREIGN KEY ("webhookId") REFERENCES "core"."webhook"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "core"."roleTarget" WHERE "webhookId" IS NOT NULL');
    await queryRunner.query('ALTER TABLE "core"."roleTarget" DROP CONSTRAINT "FK_e3c4f91f74bc6092c81b63edf39"');
    await queryRunner.query('ALTER TABLE "core"."roleTarget" DROP CONSTRAINT "IDX_ROLE_TARGET_UNIQUE_WEBHOOK"');
    await queryRunner.query('DROP INDEX "core"."IDX_ROLE_TARGET_WEBHOOK_ID"');
    await queryRunner.query('ALTER TABLE "core"."roleTarget" DROP CONSTRAINT "CHK_role_target_single_entity"');
    await queryRunner.query('ALTER TABLE "core"."roleTarget" ADD CONSTRAINT "CHK_role_target_single_entity" CHECK (("agentId" IS NOT NULL AND "userWorkspaceId" IS NULL AND "apiKeyId" IS NULL) OR ("agentId" IS NULL AND "userWorkspaceId" IS NOT NULL AND "apiKeyId" IS NULL) OR ("agentId" IS NULL AND "userWorkspaceId" IS NULL AND "apiKeyId" IS NOT NULL))');
    await queryRunner.query('ALTER TABLE "core"."roleTarget" DROP COLUMN "webhookId"');
  }
}
