import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class CalendarFieldMetadataRelation1761052489394
  implements MigrationInterface
{
  name = 'CalendarFieldMetadataRelation1761052489394';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD CONSTRAINT "FK_5c0d21d6b8d5544a24ab9787114" FOREIGN KEY ("calendarFieldMetadataId") REFERENCES "core"."fieldMetadata"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP CONSTRAINT "FK_5c0d21d6b8d5544a24ab9787114"`,
    );
  }
}
