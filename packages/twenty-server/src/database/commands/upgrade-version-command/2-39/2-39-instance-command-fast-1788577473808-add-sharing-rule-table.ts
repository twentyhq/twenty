import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.39.0', 1788577473808)
export class AddSharingRuleTableFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."sharingRule_granteeprincipaltype_enum" AS ENUM('EVERYONE', 'WORKSPACE_MEMBER', 'ROLE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."sharingRule_accesslevel_enum" AS ENUM('READ', 'READ_WRITE')`,
    );
    await queryRunner.query(
      'CREATE TABLE "core"."sharingRule" ("workspaceId" uuid NOT NULL, "universalIdentifier" uuid NOT NULL, "applicationId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "objectMetadataId" uuid NOT NULL, "name" text NOT NULL, "description" text, "granteePrincipalType" "core"."sharingRule_granteeprincipaltype_enum" NOT NULL, "granteeRoleId" uuid, "granteePrincipalId" uuid, "accessLevel" "core"."sharingRule_accesslevel_enum" NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_SHARING_RULE_ID" PRIMARY KEY ("id"))',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_91c70187e8ffe973687216fcc8" ON "core"."sharingRule" ("workspaceId", "universalIdentifier") ',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_SHARING_RULE_WORKSPACE_ID_OBJECT_METADATA_ID" ON "core"."sharingRule" ("workspaceId", "objectMetadataId") ',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_SHARING_RULE_GRANTEE_ROLE_ID" ON "core"."sharingRule" ("granteeRoleId") ',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."sharingRule" ADD CONSTRAINT "FK_00f1bd52b3f8f30efb163b5ed27" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."sharingRule" ADD CONSTRAINT "FK_ec9739678c915ce0f80e0844646" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."sharingRule" ADD CONSTRAINT "FK_9a397faafff0e12d140c194a57a" FOREIGN KEY ("objectMetadataId") REFERENCES "core"."objectMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."sharingRule" ADD CONSTRAINT "FK_1d3d4c3421c5fa98702892dd844" FOREIGN KEY ("granteeRoleId") REFERENCES "core"."role"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."sharingRule" DROP CONSTRAINT "FK_1d3d4c3421c5fa98702892dd844"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."sharingRule" DROP CONSTRAINT "FK_9a397faafff0e12d140c194a57a"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."sharingRule" DROP CONSTRAINT "FK_ec9739678c915ce0f80e0844646"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."sharingRule" DROP CONSTRAINT "FK_00f1bd52b3f8f30efb163b5ed27"',
    );
    await queryRunner.query(
      'DROP INDEX "core"."IDX_SHARING_RULE_GRANTEE_ROLE_ID"',
    );
    await queryRunner.query(
      'DROP INDEX "core"."IDX_SHARING_RULE_WORKSPACE_ID_OBJECT_METADATA_ID"',
    );
    await queryRunner.query(
      'DROP INDEX "core"."IDX_91c70187e8ffe973687216fcc8"',
    );
    await queryRunner.query('DROP TABLE "core"."sharingRule"');
    await queryRunner.query('DROP TYPE "core"."sharingRule_accesslevel_enum"');
    await queryRunner.query(
      'DROP TYPE "core"."sharingRule_granteeprincipaltype_enum"',
    );
  }
}
