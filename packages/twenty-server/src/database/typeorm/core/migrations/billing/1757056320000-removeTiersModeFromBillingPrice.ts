import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class RemoveTiersModeFromBillingPrice1757056320000
  implements MigrationInterface
{
  name = 'RemoveTiersModeFromBillingPrice1757056320000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingPrice" DROP COLUMN "tiersMode"`,
    );

    await queryRunner.query(
      `DROP TYPE IF EXISTS "core"."billingPrice_tiersmode_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."billingPrice_tiersmode_enum" AS ENUM('GRADUATED', 'VOLUME')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingPrice" ADD "tiersMode" "core"."billingPrice_tiersmode_enum"`,
    );
  }
}
