import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateBillingCoreTables1709233666080
  implements MigrationInterface
{
  name = 'UpdateBillingCoreTables1709233666080';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" ADD "stripeSubscriptionItemId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" ADD CONSTRAINT "IndexOnBillingSubscriptionIdAndStripeSubscriptionItemIdUnique" UNIQUE ("billingSubscriptionId", "stripeSubscriptionItemId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" ADD CONSTRAINT "IndexOnBillingSubscriptionIdAndStripeProductIdUnique" UNIQUE ("billingSubscriptionId", "stripeProductId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" ALTER COLUMN "deletedAt" TYPE TIMESTAMP WITH TIME ZONE USING "deletedAt" AT TIME ZONE 'UTC'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" DROP CONSTRAINT "IndexOnBillingSubscriptionIdAndStripeProductIdUnique"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" DROP CONSTRAINT "IndexOnBillingSubscriptionIdAndStripeSubscriptionItemIdUnique"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" DROP COLUMN "stripeSubscriptionItemId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" ALTER COLUMN "deletedAt" TYPE TIMESTAMP`,
    );
  }
}
