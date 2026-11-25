import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.64.0', 1795621548315)
export class AddListDateFieldMetadataIdToViewFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."view" ADD "listDateFieldMetadataId" uuid');
    await queryRunner.query('CREATE INDEX "IDX_VIEW_LIST_DATE_FIELD_METADATA" ON "core"."view" ("listDateFieldMetadataId") ');
    await queryRunner.query('ALTER TABLE "core"."view" ADD CONSTRAINT "FK_693d1312c7aecee09bc0d10449d" FOREIGN KEY ("listDateFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE SET NULL ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."view" DROP CONSTRAINT "FK_693d1312c7aecee09bc0d10449d"');
    await queryRunner.query('DROP INDEX "core"."IDX_VIEW_LIST_DATE_FIELD_METADATA"');
    await queryRunner.query('ALTER TABLE "core"."view" DROP COLUMN "listDateFieldMetadataId"');
  }
}
