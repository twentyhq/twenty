import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.57.0', 1794155686000)
export class AddRlsRuleFieldPermissionsFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."fieldPermission" DROP CONSTRAINT "IDX_FIELD_PERMISSION_FIELD_METADATA_ID_ROLE_ID_UNIQUE"');
    await queryRunner.query('ALTER TABLE "core"."fieldPermission" ADD "rowLevelPermissionPredicateGroupId" uuid');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_FIELD_PERMISSION_RLS_RULE_FIELD_ROLE_GROUP_UNIQUE" ON "core"."fieldPermission" ("fieldMetadataId", "roleId", "rowLevelPermissionPredicateGroupId") WHERE "rowLevelPermissionPredicateGroupId" IS NOT NULL');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_FIELD_PERMISSION_OBJECT_LEVEL_FIELD_ROLE_UNIQUE" ON "core"."fieldPermission" ("fieldMetadataId", "roleId") WHERE "rowLevelPermissionPredicateGroupId" IS NULL');
    await queryRunner.query('ALTER TABLE "core"."fieldPermission" ADD CONSTRAINT "FK_50aa5710a4ad47709a841d60364" FOREIGN KEY ("rowLevelPermissionPredicateGroupId") REFERENCES "core"."rowLevelPermissionPredicateGroup"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."fieldPermission" DROP CONSTRAINT "FK_50aa5710a4ad47709a841d60364"');
    await queryRunner.query('DROP INDEX "core"."IDX_FIELD_PERMISSION_OBJECT_LEVEL_FIELD_ROLE_UNIQUE"');
    await queryRunner.query('DROP INDEX "core"."IDX_FIELD_PERMISSION_RLS_RULE_FIELD_ROLE_GROUP_UNIQUE"');
    await queryRunner.query('ALTER TABLE "core"."fieldPermission" DROP COLUMN "rowLevelPermissionPredicateGroupId"');
    await queryRunner.query('ALTER TABLE "core"."fieldPermission" ADD CONSTRAINT "IDX_FIELD_PERMISSION_FIELD_METADATA_ID_ROLE_ID_UNIQUE" UNIQUE ("roleId", "fieldMetadataId")');
  }
}
