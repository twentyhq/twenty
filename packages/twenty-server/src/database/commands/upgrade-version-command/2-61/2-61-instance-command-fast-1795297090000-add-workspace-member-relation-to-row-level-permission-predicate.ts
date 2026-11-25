import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.61.0', 1795297090000)
export class AddWorkspaceMemberRelationToRowLevelPermissionPredicateFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicate" ADD "workspaceMemberRelationFieldMetadataId" uuid');
    await queryRunner.query('CREATE INDEX "IDX_RLPP_WORKSPACE_MEMBER_RELATION_FIELD_METADATA_ID" ON "core"."rowLevelPermissionPredicate" ("workspaceMemberRelationFieldMetadataId") ');
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicate" ADD CONSTRAINT "FK_820da06779b7311c63bbe8386af" FOREIGN KEY ("workspaceMemberRelationFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicate" DROP CONSTRAINT "FK_820da06779b7311c63bbe8386af"');
    await queryRunner.query('DROP INDEX "core"."IDX_RLPP_WORKSPACE_MEMBER_RELATION_FIELD_METADATA_ID"');
    await queryRunner.query('ALTER TABLE "core"."rowLevelPermissionPredicate" DROP COLUMN "workspaceMemberRelationFieldMetadataId"');
  }
}
