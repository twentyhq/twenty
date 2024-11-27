import { MigrationInterface, QueryRunner } from 'typeorm';

export class ModifBillingTable1732725228911 implements MigrationInterface {
  name = 'ModifBillingTable1732725228911';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" DROP CONSTRAINT "FK_a8deacba1a77260507a39c741dc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingPrice" DROP CONSTRAINT "IndexOnProductIdAndStripePriceIdUnique"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingProduct" DROP COLUMN "defaultPriceId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingProduct" DROP COLUMN "planKey"`,
    );
    await queryRunner.query(`DROP TYPE "core"."billingProduct_plankey_enum"`);
    await queryRunner.query(
      `ALTER TABLE "core"."billingPrice" DROP COLUMN "productId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingEntitlement" ADD "billingCustomerId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingProduct" ADD "metadata" jsonb NOT NULL DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingPrice" ADD CONSTRAINT "IndexOnStripeProductIdAndStripePriceIdUnique" UNIQUE ("stripeProductId", "stripePriceId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingEntitlement" ADD CONSTRAINT "FK_1b0b9848eb96e3779be9ec9cce9" FOREIGN KEY ("billingCustomerId") REFERENCES "core"."billingCustomer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ADD CONSTRAINT "FK_a8deacba1a77260507a39c741dc" FOREIGN KEY ("billingCustomerId") REFERENCES "core"."billingCustomer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" DROP CONSTRAINT "FK_a8deacba1a77260507a39c741dc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingEntitlement" DROP CONSTRAINT "FK_1b0b9848eb96e3779be9ec9cce9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingPrice" DROP CONSTRAINT "IndexOnStripeProductIdAndStripePriceIdUnique"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingProduct" DROP COLUMN "metadata"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingEntitlement" DROP COLUMN "billingCustomerId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingPrice" ADD "productId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."billingProduct_plankey_enum" AS ENUM('base-plan', 'pro-plan')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingProduct" ADD "planKey" "core"."billingProduct_plankey_enum" NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingProduct" ADD "defaultPriceId" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingPrice" ADD CONSTRAINT "IndexOnProductIdAndStripePriceIdUnique" UNIQUE ("stripePriceId", "productId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ADD CONSTRAINT "FK_a8deacba1a77260507a39c741dc" FOREIGN KEY ("billingCustomerId") REFERENCES "core"."billingCustomer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
