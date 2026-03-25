import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddCalendarFieldMetadataIdToViewTable1757864696439
  implements MigrationInterface
{
  name = 'AddCalendarFieldMetadataIdToViewTable1757864696439';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP CONSTRAINT "CHK_VIEW_CALENDAR_LAYOUT_NOT_NULL_WHEN_TYPE_CALENDAR"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD "calendarFieldMetadataId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD CONSTRAINT "CHK_VIEW_CALENDAR_INTEGRITY" CHECK (("type" != 'CALENDAR' OR ("calendarLayout" IS NOT NULL AND "calendarFieldMetadataId" IS NOT NULL)))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP CONSTRAINT "CHK_VIEW_CALENDAR_INTEGRITY"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP COLUMN "calendarFieldMetadataId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD CONSTRAINT "CHK_VIEW_CALENDAR_LAYOUT_NOT_NULL_WHEN_TYPE_CALENDAR" CHECK (((type <> 'CALENDAR'::core.view_type_enum) OR ("calendarLayout" IS NOT NULL)))`,
    );
  }
}
