import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.63.0', 1795523223000)
export class AddWorkspaceMemberRelationFilterToRowLevelPermissionPredicateFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicate" ADD "workspaceMemberRelationFilterFieldMetadataId" uuid');
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicate" ADD "workspaceMemberRelationFilterValues" jsonb');
    await queryRunner.query('CREATE INDEX "IDX_RLPP_WORKSPACE_MEMBER_RELATION_FILTER_FIELD_METADATA_ID" ON "core"."rowLevelPermissionPredicate" ("workspaceMemberRelationFilterFieldMetadataId") ');
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicate" ADD CONSTRAINT "FK_16732128724ef68d1d64fdd22de" FOREIGN KEY ("workspaceMemberRelationFilterFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicate" DROP CONSTRAINT "FK_16732128724ef68d1d64fdd22de"');
    await queryRunner.query('DROP INDEX "core"."IDX_RLPP_WORKSPACE_MEMBER_RELATION_FILTER_FIELD_METADATA_ID"');
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicate" DROP COLUMN "workspaceMemberRelationFilterValues"');
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicate" DROP COLUMN "workspaceMemberRelationFilterFieldMetadataId"');
  }
}
