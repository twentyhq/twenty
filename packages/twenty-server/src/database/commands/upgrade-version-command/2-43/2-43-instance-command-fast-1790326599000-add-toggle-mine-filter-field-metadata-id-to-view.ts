import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.43.0', 1790326599000)
export class AddToggleMineFilterFieldMetadataIdToViewFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."view" ADD COLUMN IF NOT EXISTS "toggleMineFilterFieldMetadataId" uuid',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_VIEW_TOGGLE_MINE_FILTER_FIELD_METADATA" ON "core"."view" ("toggleMineFilterFieldMetadataId") ',
    );
    await queryRunner.query(
      'DO $$ BEGIN ALTER TABLE "core"."view" ADD CONSTRAINT "FK_168c44855a3d03bfecca8432072" FOREIGN KEY ("toggleMineFilterFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE SET NULL ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN NULL; END $$',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."view" DROP CONSTRAINT IF EXISTS "FK_168c44855a3d03bfecca8432072"',
    );
    await queryRunner.query(
      'DROP INDEX IF EXISTS "core"."IDX_VIEW_TOGGLE_MINE_FILTER_FIELD_METADATA"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" DROP COLUMN IF EXISTS "toggleMineFilterFieldMetadataId"',
    );
  }
}
