import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHasReachedCurrentPeriodCapColumnInBillingSubscriptionItemTable1743577268972
  implements MigrationInterface
{
  name =
    'AddHasReachedCurrentPeriodCapColumnInBillingSubscriptionItemTable1743577268972';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" ADD "hasReachedCurrentPeriodCap" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" ALTER COLUMN "stripePriceId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" ALTER COLUMN "stripeSubscriptionItemId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" DROP CONSTRAINT "UQ_6a989264cab5ee2d4b424e78526"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IndexOnStripeNonNullableSubscriptionItemIdUnique" ON "core"."billingSubscriptionItem" ("stripeSubscriptionItemId") WHERE "stripeSubscriptionItemId" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "core"."IndexOnStripeNonNUllableSubscriptionItemIdUnique"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" ADD CONSTRAINT "UQ_6a989264cab5ee2d4b424e78526" UNIQUE ("stripeSubscriptionItemId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" ALTER COLUMN "stripeSubscriptionItemId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" ALTER COLUMN "stripePriceId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" DROP COLUMN "hasReachedCurrentPeriodCap"`,
    );
  }
}
