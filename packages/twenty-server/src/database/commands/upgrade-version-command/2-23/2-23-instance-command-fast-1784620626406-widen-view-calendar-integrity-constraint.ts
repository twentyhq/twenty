import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.23.0', 1784620626406)
export class WidenViewCalendarIntegrityConstraintFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."view" DROP CONSTRAINT IF EXISTS "CHK_VIEW_CALENDAR_INTEGRITY"',
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD CONSTRAINT "CHK_VIEW_CALENDAR_INTEGRITY" CHECK ("type" NOT IN ('CALENDAR', 'CALENDAR_WIDGET') OR ("calendarLayout" IS NOT NULL AND "calendarFieldMetadataId" IS NOT NULL))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."view" DROP CONSTRAINT IF EXISTS "CHK_VIEW_CALENDAR_INTEGRITY"',
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD CONSTRAINT "CHK_VIEW_CALENDAR_INTEGRITY" CHECK ("type" != 'CALENDAR' OR ("calendarLayout" IS NOT NULL AND "calendarFieldMetadataId" IS NOT NULL))`,
    );
  }
}
