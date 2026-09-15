import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.22.0', 1783956795000)
export class AddCalendarEndFieldMetadataIdToViewFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."view" ADD COLUMN IF NOT EXISTS "calendarEndFieldMetadataId" uuid',
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IDX_VIEW_CALENDAR_END_FIELD_METADATA" ON "core"."view" ("calendarEndFieldMetadataId") ',
    );
    await queryRunner.query(
      'DO $$ BEGIN ALTER TABLE "core"."view" ADD CONSTRAINT "FK_e1d69dd7402cd7df3b03ce11311" FOREIGN KEY ("calendarEndFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE SET NULL ON UPDATE NO ACTION; EXCEPTION WHEN duplicate_object THEN NULL; END $$',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."view" DROP CONSTRAINT IF EXISTS "FK_e1d69dd7402cd7df3b03ce11311"',
    );
    await queryRunner.query(
      'DROP INDEX IF EXISTS "core"."IDX_VIEW_CALENDAR_END_FIELD_METADATA"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" DROP COLUMN IF EXISTS "calendarEndFieldMetadataId"',
    );
  }
}
