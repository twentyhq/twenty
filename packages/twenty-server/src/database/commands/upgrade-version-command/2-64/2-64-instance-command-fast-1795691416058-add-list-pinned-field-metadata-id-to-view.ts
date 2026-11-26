import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.64.0', 1795691416058)
export class AddListPinnedFieldMetadataIdToViewFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."view" ADD "listPinnedFieldMetadataId" uuid');
    await queryRunner.query('CREATE INDEX "IDX_VIEW_LIST_PINNED_FIELD_METADATA" ON "core"."view" ("listPinnedFieldMetadataId") ');
    await queryRunner.query('ALTER TABLE "core"."view" ADD CONSTRAINT "FK_b5dd2a0b1e31a6e445fd6fa12ae" FOREIGN KEY ("listPinnedFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE SET NULL ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."view" DROP CONSTRAINT "FK_b5dd2a0b1e31a6e445fd6fa12ae"');
    await queryRunner.query('DROP INDEX "core"."IDX_VIEW_LIST_PINNED_FIELD_METADATA"');
    await queryRunner.query('ALTER TABLE "core"."view" DROP COLUMN "listPinnedFieldMetadataId"');
  }
}
