import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBillingTables1732640291160 implements MigrationInterface {
  name = 'AddBillingTables1732640291160';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."billingCustomer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "stripeCustomerId" character varying NOT NULL, "workspaceId" character varying NOT NULL, CONSTRAINT "IndexOnWorkspaceIdAndStripeCustomerIdUnique" UNIQUE ("workspaceId", "stripeCustomerId"), CONSTRAINT "PK_5fffcd69bf722c297a3d5c3f3bc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."billingProduct_plankey_enum" AS ENUM('base-plan', 'pro-plan')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."billingProduct" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "active" boolean NOT NULL, "stripeProductId" character varying NOT NULL, "defaultPriceId" character varying NOT NULL, "defaultStripePriceId" character varying NOT NULL, "planKey" "core"."billingProduct_plankey_enum" NOT NULL, CONSTRAINT "PK_8bb3c7be66db8e05476808b0ca7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."billingPrice_usagetype_enum" AS ENUM('metered', 'licensed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."billingPrice_interval_enum" AS ENUM('day', 'month', 'week', 'year')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."billingPrice" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "stripePriceId" character varying NOT NULL, "active" boolean NOT NULL, "usageType" "core"."billingPrice_usagetype_enum" NOT NULL, "interval" "core"."billingPrice_interval_enum", "productId" character varying NOT NULL, "stripeProductId" character varying NOT NULL, "billingProductId" uuid, CONSTRAINT "IndexOnProductIdAndStripePriceIdUnique" UNIQUE ("productId", "stripePriceId"), CONSTRAINT "PK_13927aef8d4e68e176a61c33d89" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ADD "billingCustomerId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ADD CONSTRAINT "FK_a8deacba1a77260507a39c741dc" FOREIGN KEY ("billingCustomerId") REFERENCES "core"."billingCustomer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingPrice" ADD CONSTRAINT "FK_666a8acde646487d94494baef05" FOREIGN KEY ("billingProductId") REFERENCES "core"."billingProduct"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingPrice" DROP CONSTRAINT "FK_666a8acde646487d94494baef05"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" DROP CONSTRAINT "FK_a8deacba1a77260507a39c741dc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" DROP COLUMN "billingCustomerId"`,
    );
    await queryRunner.query(`DROP TABLE "core"."billingPrice"`);
    await queryRunner.query(`DROP TYPE "core"."billingPrice_interval_enum"`);
    await queryRunner.query(`DROP TYPE "core"."billingPrice_usagetype_enum"`);
    await queryRunner.query(`DROP TABLE "core"."billingProduct"`);
    await queryRunner.query(`DROP TYPE "core"."billingProduct_plankey_enum"`);
    await queryRunner.query(`DROP TABLE "core"."billingCustomer"`);
  }
}
