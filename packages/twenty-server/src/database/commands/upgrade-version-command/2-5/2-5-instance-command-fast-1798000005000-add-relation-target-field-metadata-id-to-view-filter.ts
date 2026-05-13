import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.5.0', 1798000005000)
export class AddRelationTargetFieldMetadataIdToViewFilterFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" ADD COLUMN IF NOT EXISTS "relationTargetFieldMetadataId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter"
       ADD CONSTRAINT "FK_VIEW_FILTER_RELATION_TARGET_FIELD_METADATA_ID"
       FOREIGN KEY ("relationTargetFieldMetadataId")
       REFERENCES "core"."fieldMetadata"("id")
       ON DELETE SET NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_VIEW_FILTER_RELATION_TARGET_FIELD_METADATA_ID"
       ON "core"."viewFilter" ("relationTargetFieldMetadataId")
       WHERE "relationTargetFieldMetadataId" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_VIEW_FILTER_RELATION_TARGET_FIELD_METADATA_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" DROP CONSTRAINT IF EXISTS "FK_VIEW_FILTER_RELATION_TARGET_FIELD_METADATA_ID"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" DROP COLUMN IF EXISTS "relationTargetFieldMetadataId"`,
    );
  }
}
