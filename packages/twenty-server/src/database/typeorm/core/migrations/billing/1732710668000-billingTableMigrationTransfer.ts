import { MigrationInterface, QueryRunner } from 'typeorm';

export class BillingTableMigrationTransfer1732710668000
  implements MigrationInterface
{
  name = 'BillingTableMigrationTransfer1732710668000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    try {
      await queryRunner.query(
        `ALTER TABLE "core"."billingSubscriptionItem" ALTER COLUMN "deletedAt" TYPE TIMESTAMP WITH TIME ZONE USING "deletedAt" AT TIME ZONE 'UTC'`,
      );
      await queryRunner.query(
        `ALTER TABLE "core"."billingSubscription" ALTER COLUMN "deletedAt" TYPE TIMESTAMP WITH TIME ZONE USING "deletedAt" AT TIME ZONE 'UTC'`,
      );
    } catch (error) {
      // Column may have already been altered in UseTimestampWithTZ1711633823798
      // so we don't need to do anything
    }

    // From UpdateInconsistentUserConstraint1715593226719

    try {
      await queryRunner.query(
        `ALTER TABLE "core"."billingSubscription" ALTER COLUMN "status" TYPE text`,
      );
      await queryRunner.query(
        `ALTER TABLE "core"."billingSubscription" ALTER COLUMN "interval" TYPE text`,
      );
    } catch (error) {
      // Column may have already been altered in UseEnumForSubscriptionStatusInterval1719327438923
      // so we don't need to do anything
    }

    try {
      await queryRunner.query(
        `CREATE TYPE "core"."billingSubscription_status_enum" AS ENUM('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'paused', 'trialing', 'unpaid')`,
      );
      await queryRunner.query(
        `ALTER TABLE "core"."billingSubscription" ALTER COLUMN "status" TYPE "core"."billingSubscription_status_enum" USING "status"::"core"."billingSubscription_status_enum"`,
      );
      await queryRunner.query(
        `ALTER TABLE "core"."billingSubscription" ALTER COLUMN "status" SET NOT NULL`,
      );
      await queryRunner.query(
        `CREATE TYPE "core"."billingSubscription_interval_enum" AS ENUM('day', 'month', 'week', 'year')`,
      );
      await queryRunner.query(
        `ALTER TABLE "core"."billingSubscription" ALTER COLUMN "interval" TYPE "core"."billingSubscription_interval_enum" USING "interval"::"core"."billingSubscription_interval_enum"`,
      );
    } catch (error) {
      // Column may have already been altered in UseEnumForSubscriptionStatusInterval1719327438923
      // so we don't need to do anything
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    try {
      await queryRunner.query(
        `ALTER TABLE "core"."billingSubscription" ALTER COLUMN "interval" TYPE text`,
      );
      await queryRunner.query(
        `DROP TYPE "core"."billingSubscription_interval_enum"`,
      );
      await queryRunner.query(
        `ALTER TABLE "core"."billingSubscription" ALTER COLUMN "status" TYPE text`,
      );
      await queryRunner.query(
        `DROP TYPE "core"."billingSubscription_status_enum"`,
      );
    } catch (error) {
      // Column may have already been altered in UseEnumForSubscriptionStatusInterval1719327438923
      // so we don't need to do anything
    }

    try {
      await queryRunner.query(
        `ALTER TABLE "core"."billingSubscription" ALTER COLUMN "interval" TYPE character varying`,
      );
      await queryRunner.query(
        `ALTER TABLE "core"."billingSubscription" ALTER COLUMN "status" TYPE character varying`,
      );
    } catch (error) {
      // Column may have already been altered in UseEnumForSubscriptionStatusInterval1719327438923
      // so we don't need to do anything
    }

    try {
      await queryRunner.query(
        `ALTER TABLE "core"."billingSubscriptionItem" ALTER COLUMN "deletedAt" TYPE TIMESTAMP`,
      );
      await queryRunner.query(
        `ALTER TABLE "core"."billingSubscription" ALTER COLUMN "deletedAt" TYPE TIMESTAMP`,
      );
    } catch (error) {
      // Column may have already been altered in UseTimestampWithTZ1711633823798
      // so we don't need to do anything
    }
  }
}
