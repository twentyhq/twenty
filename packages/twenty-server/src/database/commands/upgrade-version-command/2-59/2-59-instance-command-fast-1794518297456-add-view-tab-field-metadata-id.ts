import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.59.0', 1794518297456)
export class AddViewTabFieldMetadataIdFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."view" ADD "tabFieldMetadataId" uuid',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_VIEW_TAB_FIELD_METADATA" ON "core"."view" ("tabFieldMetadataId") ',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" ADD CONSTRAINT "FK_b7fdd702c636a1671fdf01d3577" FOREIGN KEY ("tabFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE SET NULL ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."view" DROP CONSTRAINT "FK_b7fdd702c636a1671fdf01d3577"',
    );
    await queryRunner.query('DROP INDEX "core"."IDX_VIEW_TAB_FIELD_METADATA"');
    await queryRunner.query(
      'ALTER TABLE "core"."view" DROP COLUMN "tabFieldMetadataId"',
    );
  }
}
