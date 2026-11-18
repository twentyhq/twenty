import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.61.0', 1795006012069)
export class AddViewSortRelationTargetFieldMetadataIdFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."viewSort" ADD "relationTargetFieldMetadataId" uuid');
    await queryRunner.query('CREATE INDEX "IDX_VIEW_SORT_RELATION_TARGET_FIELD_METADATA_ID" ON "core"."viewSort" ("relationTargetFieldMetadataId") WHERE "relationTargetFieldMetadataId" IS NOT NULL');
    await queryRunner.query('ALTER TABLE "core"."viewSort" ADD CONSTRAINT "FK_128973737fae365a2db6bba3c49" FOREIGN KEY ("relationTargetFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE SET NULL ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."viewSort" DROP CONSTRAINT "FK_128973737fae365a2db6bba3c49"');
    await queryRunner.query('DROP INDEX "core"."IDX_VIEW_SORT_RELATION_TARGET_FIELD_METADATA_ID"');
    await queryRunner.query('ALTER TABLE "core"."viewSort" DROP COLUMN "relationTargetFieldMetadataId"');
  }
}
