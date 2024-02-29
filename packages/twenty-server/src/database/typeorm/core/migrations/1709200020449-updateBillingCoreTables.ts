import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateBillingCoreTables1709200020449
  implements MigrationInterface
{
  name = 'UpdateBillingCoreTables1709200020449';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" ADD "stripeSubscriptionItemId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" ADD CONSTRAINT "IndexOnBillingSubscriptionIdAndProductIdUnique" UNIQUE ("billingSubscriptionId", "stripeProductId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" DROP CONSTRAINT "IndexOnBillingSubscriptionIdAndProductIdUnique"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" DROP COLUMN "stripeSubscriptionItemId"`,
    );
  }
}
