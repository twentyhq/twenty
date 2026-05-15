import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.6.0', 1798000005000)
export class AddRelationTargetFieldMetadataIdToViewFilterFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" ADD "relationTargetFieldMetadataId" uuid`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_VIEW_FILTER_RELATION_TARGET_FIELD_METADATA_ID" ON "core"."viewFilter" ("relationTargetFieldMetadataId") WHERE "relationTargetFieldMetadataId" IS NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" ADD CONSTRAINT "FK_dbe259395cbd9a54c1c17d12b0b" FOREIGN KEY ("relationTargetFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" DROP CONSTRAINT "FK_dbe259395cbd9a54c1c17d12b0b"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_VIEW_FILTER_RELATION_TARGET_FIELD_METADATA_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" DROP COLUMN "relationTargetFieldMetadataId"`,
    );
  }
}
