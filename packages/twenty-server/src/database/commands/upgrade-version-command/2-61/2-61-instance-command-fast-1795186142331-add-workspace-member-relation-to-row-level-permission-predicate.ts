import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.61.0', 1795186142331)
export class AddWorkspaceMemberRelationToRowLevelPermissionPredicateFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicate" ADD "workspaceMemberRelationFieldMetadataId" uuid');
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicate" ADD "workspaceMemberRelationFilterFieldMetadataId" uuid');
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicate" ADD "workspaceMemberRelationFilterValue" jsonb');
    await queryRunner.query('CREATE INDEX "IDX_RLPP_WORKSPACE_MEMBER_RELATION_FILTER_FIELD_METADATA_ID" ON "core"."rowLevelPermissionPredicate" ("workspaceMemberRelationFilterFieldMetadataId") ');
    await queryRunner.query('CREATE INDEX "IDX_RLPP_WORKSPACE_MEMBER_RELATION_FIELD_METADATA_ID" ON "core"."rowLevelPermissionPredicate" ("workspaceMemberRelationFieldMetadataId") ');
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicate" ADD CONSTRAINT "FK_820da06779b7311c63bbe8386af" FOREIGN KEY ("workspaceMemberRelationFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicate" ADD CONSTRAINT "FK_16732128724ef68d1d64fdd22de" FOREIGN KEY ("workspaceMemberRelationFilterFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicate" DROP CONSTRAINT "FK_16732128724ef68d1d64fdd22de"');
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicate" DROP CONSTRAINT "FK_820da06779b7311c63bbe8386af"');
    await queryRunner.query('DROP INDEX "core"."IDX_RLPP_WORKSPACE_MEMBER_RELATION_FIELD_METADATA_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_RLPP_WORKSPACE_MEMBER_RELATION_FILTER_FIELD_METADATA_ID"');
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicate" DROP COLUMN "workspaceMemberRelationFilterValue"');
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicate" DROP COLUMN "workspaceMemberRelationFilterFieldMetadataId"');
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicate" DROP COLUMN "workspaceMemberRelationFieldMetadataId"');
  }
}
