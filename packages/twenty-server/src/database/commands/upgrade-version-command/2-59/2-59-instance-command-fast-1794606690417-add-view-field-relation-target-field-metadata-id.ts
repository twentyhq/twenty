import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.59.0', 1794606690417)
export class AddViewFieldRelationTargetFieldMetadataIdFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."viewField" ADD "relationTargetFieldMetadataId" uuid');
    await queryRunner.query('CREATE INDEX "IDX_VIEW_FIELD_RELATION_TARGET_FIELD_METADATA_ID" ON "core"."viewField" ("relationTargetFieldMetadataId") WHERE "relationTargetFieldMetadataId" IS NOT NULL');
    await queryRunner.query('ALTER TABLE "core"."viewField" ADD CONSTRAINT "FK_04182cf3303e503661915eb27ee" FOREIGN KEY ("relationTargetFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."viewField" DROP CONSTRAINT "FK_04182cf3303e503661915eb27ee"');
    await queryRunner.query('DROP INDEX "core"."IDX_VIEW_FIELD_RELATION_TARGET_FIELD_METADATA_ID"');
    await queryRunner.query('ALTER TABLE "core"."viewField" DROP COLUMN "relationTargetFieldMetadataId"');
  }
}
