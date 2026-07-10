import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.20.0', 1783695496996)
export class AddCalendarEndFieldMetadataIdToViewFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."view" ADD "calendarEndFieldMetadataId" uuid',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_VIEW_CALENDAR_END_FIELD_METADATA" ON "core"."view" ("calendarEndFieldMetadataId") ',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" ADD CONSTRAINT "FK_e1d69dd7402cd7df3b03ce11311" FOREIGN KEY ("calendarEndFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE SET NULL ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."view" DROP CONSTRAINT "FK_e1d69dd7402cd7df3b03ce11311"',
    );
    await queryRunner.query(
      'DROP INDEX "core"."IDX_VIEW_CALENDAR_END_FIELD_METADATA"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" DROP COLUMN "calendarEndFieldMetadataId"',
    );
  }
}
