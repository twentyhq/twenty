import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddPreferredCalendarToUserWorkspace1757000000000 implements MigrationInterface {
  name = 'AddPreferredCalendarToUserWorkspace1757000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" ADD "preferredCalendar" character varying NOT NULL DEFAULT 'gregorian'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."userWorkspace" DROP COLUMN "preferredCalendar"`
    );
  }
}
