import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFallbackToCommandMenuItemAvailabilityType1772832588833
  implements MigrationInterface
{
  name = 'AddFallbackToCommandMenuItemAvailabilityType1772832588833';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "core"."commandMenuItem_availabilitytype_enum" ADD VALUE IF NOT EXISTS 'FALLBACK' AFTER 'RECORD_SELECTION'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" ALTER COLUMN "availabilityType" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" ALTER COLUMN "availabilityType" TYPE character varying`,
    );
    await queryRunner.query(
      `UPDATE "core"."commandMenuItem" SET "availabilityType" = 'GLOBAL' WHERE "availabilityType" = 'FALLBACK'`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."commandMenuItem_availabilitytype_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."commandMenuItem_availabilitytype_enum" AS ENUM('GLOBAL', 'RECORD_SELECTION')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" ALTER COLUMN "availabilityType" TYPE "core"."commandMenuItem_availabilitytype_enum" USING "availabilityType"::"core"."commandMenuItem_availabilitytype_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."commandMenuItem" ALTER COLUMN "availabilityType" SET DEFAULT 'GLOBAL'`,
    );
  }
}
