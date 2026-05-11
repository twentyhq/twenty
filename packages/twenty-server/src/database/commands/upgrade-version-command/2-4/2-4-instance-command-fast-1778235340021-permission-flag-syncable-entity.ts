import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.4.0', 1778235340021)
export class PermissionFlagSyncableEntityFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."permissionFlag" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "workspaceId" uuid NOT NULL,
        "applicationId" uuid NOT NULL,
        "universalIdentifier" uuid NOT NULL,
        "key" varchar NOT NULL,
        "label" varchar NOT NULL,
        "description" text,
        "iconKey" varchar,
        "permissionType" varchar NOT NULL,
        "isRelevantForAgents" boolean NOT NULL DEFAULT false,
        "isRelevantForUsers" boolean NOT NULL DEFAULT false,
        "isRelevantForApiKeys" boolean NOT NULL DEFAULT false,
        "isCustom" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "IDX_PERMISSION_FLAG_KEY_WORKSPACE_ID_UNIQUE" UNIQUE ("key", "workspaceId"),
        CONSTRAINT "PK_permissionFlag_id" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_PERMISSION_FLAG_APPLICATION_ID" ON "core"."permissionFlag" ("applicationId")`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_d7771c026b81fb7762da3f7512" ON "core"."permissionFlag" ("workspaceId", "universalIdentifier")`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag"
       ADD CONSTRAINT "FK_5faba4fac7d98e26a02eac5eebc"
       FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id")
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag"
       ADD CONSTRAINT "FK_90a41ee79a926b30490b7f60c6d"
       FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id")
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag" DROP CONSTRAINT IF EXISTS "FK_90a41ee79a926b30490b7f60c6d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlag" DROP CONSTRAINT IF EXISTS "FK_5faba4fac7d98e26a02eac5eebc"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_d7771c026b81fb7762da3f7512"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_PERMISSION_FLAG_APPLICATION_ID"`,
    );
    await queryRunner.query(
      `DROP TABLE IF EXISTS "core"."permissionFlag"`,
    );
  }
}
