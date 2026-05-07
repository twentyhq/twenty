import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.4.0', 1799000000000)
export class PermissionFlagDefinitionSyncableEntityFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."permissionFlagDefinition" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "workspaceId" uuid NOT NULL,
        "applicationId" uuid NOT NULL,
        "universalIdentifier" uuid NOT NULL,
        "key" varchar NOT NULL,
        "label" varchar NOT NULL,
        "description" text,
        "iconKey" varchar,
        "category" varchar NOT NULL,
        "isRelevantForAgents" boolean NOT NULL DEFAULT false,
        "isRelevantForUsers" boolean NOT NULL DEFAULT false,
        "isRelevantForApiKeys" boolean NOT NULL DEFAULT false,
        "isCustom" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "IDX_PERMISSION_FLAG_DEFINITION_KEY_WORKSPACE_ID_UNIQUE" UNIQUE ("key", "workspaceId"),
        CONSTRAINT "PK_permissionFlagDefinition_id" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_PERMISSION_FLAG_DEFINITION_APPLICATION_ID" ON "core"."permissionFlagDefinition" ("applicationId")`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_PERMISSION_FLAG_DEFINITION_WORKSPACE_UNIVERSAL_IDENTIFIER" ON "core"."permissionFlagDefinition" ("workspaceId", "universalIdentifier")`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlagDefinition"
       ADD CONSTRAINT "FK_PERMISSION_FLAG_DEFINITION_WORKSPACE"
       FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id")
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlagDefinition"
       ADD CONSTRAINT "FK_PERMISSION_FLAG_DEFINITION_APPLICATION"
       FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id")
       ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlagDefinition" DROP CONSTRAINT "FK_PERMISSION_FLAG_DEFINITION_APPLICATION"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."permissionFlagDefinition" DROP CONSTRAINT "FK_PERMISSION_FLAG_DEFINITION_WORKSPACE"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_PERMISSION_FLAG_DEFINITION_WORKSPACE_UNIVERSAL_IDENTIFIER"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_PERMISSION_FLAG_DEFINITION_APPLICATION_ID"`,
    );
    await queryRunner.query(`DROP TABLE "core"."permissionFlagDefinition"`);
  }
}
