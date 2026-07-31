import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.26.0', 1785516963000)
export class AddCalendarTimelineLayoutFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "core"."view_calendarlayout_enum" ADD VALUE IF NOT EXISTS 'TIMELINE' AFTER 'MONTH'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "core"."view" SET "calendarLayout" = 'MONTH' WHERE "calendarLayout" = 'TIMELINE'`,
    );
    await queryRunner.query(
      `ALTER TYPE "core"."view_calendarlayout_enum" RENAME TO "view_calendarlayout_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."view_calendarlayout_enum" AS ENUM('DAY', 'WEEK', 'MONTH')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "calendarLayout" TYPE "core"."view_calendarlayout_enum" USING "calendarLayout"::"text"::"core"."view_calendarlayout_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."view_calendarlayout_enum_old"`,
    );
  }
}
