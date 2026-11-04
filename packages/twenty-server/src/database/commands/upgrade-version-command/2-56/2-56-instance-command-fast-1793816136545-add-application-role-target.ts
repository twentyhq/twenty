import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// Shipped in 2.56: it reached main's 2-55 directory after twenty/v2.55.0 was tagged, so instances
// on 2.55.0 never ran it. Environments that ran that 2.55 copy reach it again, hence the guards.
@RegisteredInstanceCommand('2.56.0', 1793816136545)
export class AddApplicationRoleTargetFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."roleTarget" ADD COLUMN IF NOT EXISTS "targetApplicationId" uuid',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."role" ADD COLUMN IF NOT EXISTS "canBeAssignedToApplications" boolean NOT NULL DEFAULT false',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_ROLE_TARGET_TARGET_APPLICATION_ID" ON "core"."roleTarget" ("targetApplicationId") ',
    );
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'IDX_ROLE_TARGET_UNIQUE_TARGET_APPLICATION'
            AND conrelid = '"core"."roleTarget"'::regclass
        ) THEN
          ALTER TABLE "core"."roleTarget"
            ADD CONSTRAINT "IDX_ROLE_TARGET_UNIQUE_TARGET_APPLICATION" UNIQUE ("workspaceId", "targetApplicationId");
        END IF;
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'FK_3f78f147358cb6d12a82ec02a96'
            AND conrelid = '"core"."roleTarget"'::regclass
        ) THEN
          ALTER TABLE "core"."roleTarget"
            ADD CONSTRAINT "FK_3f78f147358cb6d12a82ec02a96" FOREIGN KEY ("targetApplicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;
      END
      $$
    `);
    await queryRunner.query(
      'ALTER TABLE "core"."roleTarget" DROP CONSTRAINT IF EXISTS "CHK_role_target_single_entity"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."roleTarget" ADD CONSTRAINT "CHK_role_target_single_entity" CHECK ((("agentId" IS NOT NULL)::int + ("userWorkspaceId" IS NOT NULL)::int + ("apiKeyId" IS NOT NULL)::int + ("webhookId" IS NOT NULL)::int + ("targetApplicationId" IS NOT NULL)::int) = 1)',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DELETE FROM "core"."roleTarget" WHERE "targetApplicationId" IS NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."roleTarget" DROP CONSTRAINT "CHK_role_target_single_entity"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."roleTarget" ADD CONSTRAINT "CHK_role_target_single_entity" CHECK ((("agentId" IS NOT NULL)::int + ("userWorkspaceId" IS NOT NULL)::int + ("apiKeyId" IS NOT NULL)::int + ("webhookId" IS NOT NULL)::int) = 1)',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."roleTarget" DROP CONSTRAINT "FK_3f78f147358cb6d12a82ec02a96"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."roleTarget" DROP CONSTRAINT "IDX_ROLE_TARGET_UNIQUE_TARGET_APPLICATION"',
    );
    await queryRunner.query(
      'DROP INDEX "core"."IDX_ROLE_TARGET_TARGET_APPLICATION_ID"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."role" DROP COLUMN "canBeAssignedToApplications"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."roleTarget" DROP COLUMN "targetApplicationId"',
    );
  }
}
