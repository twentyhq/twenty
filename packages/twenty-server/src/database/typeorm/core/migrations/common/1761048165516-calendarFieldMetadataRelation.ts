import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class CalendarFieldMetadataRelation1761048165516
  implements MigrationInterface
{
  name = 'CalendarFieldMetadataRelation1761048165516';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD CONSTRAINT "FK_calendar_field_metadata_id" FOREIGN KEY ("calendarFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP CONSTRAINT "FK_calendar_field_metadata_id"`,
    );
  }
}

