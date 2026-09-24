import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.43.0', 1790281407000)
export class AddMineFilterFieldMetadataIdToViewFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."view" ADD COLUMN IF NOT EXISTS "mineFilterFieldMetadataId" uuid',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_VIEW_MINE_FILTER_FIELD_METADATA" ON "core"."view" ("mineFilterFieldMetadataId") ',
    );
    await queryRunner.query(
      'DO $$ BEGIN ALTER TABLE "core"."view" ADD CONSTRAINT "FK_562fbba5c9c17efbf2224577917" FOREIGN KEY ("mineFilterFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE SET NULL ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN NULL; END $$',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."view" DROP CONSTRAINT IF EXISTS "FK_562fbba5c9c17efbf2224577917"',
    );
    await queryRunner.query(
      'DROP INDEX IF EXISTS "core"."IDX_VIEW_MINE_FILTER_FIELD_METADATA"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" DROP COLUMN IF EXISTS "mineFilterFieldMetadataId"',
    );
  }
}
