import { MigrationInterface, QueryRunner } from 'typeorm';

export class SecondUpdateBillingCoreTables1709221963343
  implements MigrationInterface
{
  name = 'SecondUpdateBillingCoreTables1709221963343';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" DROP CONSTRAINT "IndexOnBillingSubscriptionIdAndProductIdUnique"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" ADD CONSTRAINT "IndexOnBillingSubscriptionIdAndStripeSubscriptionItemIdUnique" UNIQUE ("billingSubscriptionId", "stripeSubscriptionItemId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" ADD CONSTRAINT "IndexOnBillingSubscriptionIdAndStripeProductIdUnique" UNIQUE ("billingSubscriptionId", "stripeProductId")`,
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
      `ALTER TABLE "core"."billingSubscriptionItem" ADD CONSTRAINT "IndexOnBillingSubscriptionIdAndProductIdUnique" UNIQUE ("billingSubscriptionId", "stripeProductId")`,
    );
  }
}
