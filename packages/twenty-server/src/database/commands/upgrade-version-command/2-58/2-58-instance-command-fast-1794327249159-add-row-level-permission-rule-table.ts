import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.58.0', 1794327249159)
export class AddRowLevelPermissionRuleTableFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "core"."rowLevelPermissionRule" ("workspaceId" uuid NOT NULL, "universalIdentifier" uuid NOT NULL, "applicationId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "roleId" uuid NOT NULL, "objectMetadataId" uuid NOT NULL, "canReadRecords" boolean NOT NULL DEFAULT false, "canCreateRecords" boolean NOT NULL DEFAULT false, "canUpdateRecords" boolean NOT NULL DEFAULT false, "canSoftDeleteRecords" boolean NOT NULL DEFAULT false, "canDestroyRecords" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_97afab627d6cf66841cbf92ccd2" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_993aee642e113094f9e22b0728" ON "core"."rowLevelPermissionRule" ("workspaceId", "universalIdentifier") ');
    await queryRunner.query('CREATE INDEX "IDX_RLPR_WORKSPACE_ID_ROLE_ID_OBJECT_METADATA_ID" ON "core"."rowLevelPermissionRule" ("workspaceId", "roleId", "objectMetadataId") ');
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionRule" ADD CONSTRAINT "FK_fb9ca25039bd4009d2af1ad721f" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionRule" ADD CONSTRAINT "FK_d0282360068781f432cd0108cd2" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionRule" ADD CONSTRAINT "FK_75fe6c127241395429e691cc09c" FOREIGN KEY ("roleId") REFERENCES "core"."role"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionRule" ADD CONSTRAINT "FK_53ebd0f6b6a09ba95da5b75db23" FOREIGN KEY ("objectMetadataId") REFERENCES "core"."objectMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionRule" DROP CONSTRAINT "FK_53ebd0f6b6a09ba95da5b75db23"');
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionRule" DROP CONSTRAINT "FK_75fe6c127241395429e691cc09c"');
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionRule" DROP CONSTRAINT "FK_d0282360068781f432cd0108cd2"');
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionRule" DROP CONSTRAINT "FK_fb9ca25039bd4009d2af1ad721f"');
    await queryRunner.query('DROP INDEX "core"."IDX_RLPR_WORKSPACE_ID_ROLE_ID_OBJECT_METADATA_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_993aee642e113094f9e22b0728"');
    await queryRunner.query('DROP TABLE "core"."rowLevelPermissionRule"');
  }
}
