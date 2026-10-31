import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.55.0', 1793433867335)
export class AddApplicationGrantedRolesFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."roleTarget" ADD "targetApplicationId" uuid');
    await queryRunner.query('ALTER TABLE "core"."role" ADD "canBeAssignedToApplications" boolean NOT NULL DEFAULT false');
    await queryRunner.query('ALTER TABLE "core"."application" ADD "approvedRoleRequest" jsonb');
    await queryRunner.query('CREATE INDEX "IDX_ROLE_TARGET_TARGET_APPLICATION_ID" ON "core"."roleTarget" ("targetApplicationId") ');
    await queryRunner.query('ALTER TABLE "core"."roleTarget" ADD CONSTRAINT "IDX_ROLE_TARGET_UNIQUE_TARGET_APPLICATION" UNIQUE ("workspaceId", "targetApplicationId")');
    await queryRunner.query('ALTER TABLE "core"."roleTarget" ADD CONSTRAINT "FK_3f78f147358cb6d12a82ec02a96" FOREIGN KEY ("targetApplicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    // The generator does not diff check constraints
    await queryRunner.query('ALTER TABLE "core"."roleTarget" DROP CONSTRAINT "CHK_role_target_single_entity"');
    await queryRunner.query('ALTER TABLE "core"."roleTarget" ADD CONSTRAINT "CHK_role_target_single_entity" CHECK ((("agentId" IS NOT NULL)::int + ("userWorkspaceId" IS NOT NULL)::int + ("apiKeyId" IS NOT NULL)::int + ("webhookId" IS NOT NULL)::int + ("targetApplicationId" IS NOT NULL)::int) = 1)');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM "core"."roleTarget" WHERE "targetApplicationId" IS NOT NULL');
    await queryRunner.query('ALTER TABLE "core"."roleTarget" DROP CONSTRAINT "CHK_role_target_single_entity"');
    await queryRunner.query('ALTER TABLE "core"."roleTarget" ADD CONSTRAINT "CHK_role_target_single_entity" CHECK ((("agentId" IS NOT NULL)::int + ("userWorkspaceId" IS NOT NULL)::int + ("apiKeyId" IS NOT NULL)::int + ("webhookId" IS NOT NULL)::int) = 1)');
    await queryRunner.query('ALTER TABLE "core"."roleTarget" DROP CONSTRAINT "FK_3f78f147358cb6d12a82ec02a96"');
    await queryRunner.query('ALTER TABLE "core"."roleTarget" DROP CONSTRAINT "IDX_ROLE_TARGET_UNIQUE_TARGET_APPLICATION"');
    await queryRunner.query('DROP INDEX "core"."IDX_ROLE_TARGET_TARGET_APPLICATION_ID"');
    await queryRunner.query('ALTER TABLE "core"."application" DROP COLUMN "approvedRoleRequest"');
    await queryRunner.query('ALTER TABLE "core"."role" DROP COLUMN "canBeAssignedToApplications"');
    await queryRunner.query('ALTER TABLE "core"."roleTarget" DROP COLUMN "targetApplicationId"');
  }
}
