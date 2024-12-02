import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIntervalToBillingSubscription1710926613773
  implements MigrationInterface
{
  name = 'AddIntervalToBillingSubscription1710926613773';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ADD "interval" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ALTER COLUMN "interval" TYPE text`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."billingSubscription_interval_enum" AS ENUM('day', 'month', 'week', 'year')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ALTER COLUMN "interval" TYPE "core"."billingSubscription_interval_enum" USING "interval"::"core"."billingSubscription_interval_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ALTER COLUMN "interval" TYPE text`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" DROP COLUMN "interval"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."billingSubscription_interval_enum"`,
    );
  }
}
