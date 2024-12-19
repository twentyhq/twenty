import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddConstraintsOnBillingTables1734450749954
  implements MigrationInterface
{
  name = 'AddConstraintsOnBillingTables1734450749954';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" DROP CONSTRAINT "IndexOnBillingSubscriptionIdAndStripeSubscriptionItemIdUnique"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingCustomer" DROP CONSTRAINT "IndexOnWorkspaceIdAndStripeCustomerIdUnique"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" ADD CONSTRAINT "UQ_6a989264cab5ee2d4b424e78526" UNIQUE ("stripeSubscriptionItemId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" DROP COLUMN "quantity"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" ADD "quantity" numeric`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingCustomer" ADD CONSTRAINT "UQ_53c2ef50e9611082f83d760897d" UNIQUE ("workspaceId")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IndexOnActiveSubscriptionPerWorkspace" ON "core"."billingSubscription" ("workspaceId") WHERE status IN ('trialing', 'active', 'past_due')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingEntitlement" ADD CONSTRAINT "FK_766a1918aa3dbe0d67d3df62356" FOREIGN KEY ("stripeCustomerId") REFERENCES "core"."billingCustomer"("stripeCustomerId") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingEntitlement" DROP CONSTRAINT "FK_766a1918aa3dbe0d67d3df62356"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IndexOnActiveSubscriptionPerWorkspace"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingCustomer" DROP CONSTRAINT "UQ_53c2ef50e9611082f83d760897d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" DROP COLUMN "quantity"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" ADD "quantity" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" DROP CONSTRAINT "UQ_6a989264cab5ee2d4b424e78526"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingCustomer" ADD CONSTRAINT "IndexOnWorkspaceIdAndStripeCustomerIdUnique" UNIQUE ("workspaceId", "stripeCustomerId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" ADD CONSTRAINT "IndexOnBillingSubscriptionIdAndStripeSubscriptionItemIdUnique" UNIQUE ("billingSubscriptionId", "stripeSubscriptionItemId")`,
    );
  }
}
