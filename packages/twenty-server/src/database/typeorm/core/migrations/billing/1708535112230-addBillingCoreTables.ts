import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddBillingCoreTables1708535112230 implements MigrationInterface {
  name = 'AddBillingCoreTables1708535112230';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."billingEntitlement" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" text NOT NULL, "workspaceId" uuid NOT NULL, "stripeCustomerId" character varying NOT NULL, "value" boolean NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "IDX_BILLING_ENTITLEMENT_KEY_WORKSPACE_ID_UNIQUE" UNIQUE ("key", "workspaceId"), CONSTRAINT "PK_4e6ed788c3ca0bf6610d5022576" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."billingCustomer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "workspaceId" uuid NOT NULL, "stripeCustomerId" character varying NOT NULL, CONSTRAINT "UQ_53c2ef50e9611082f83d760897d" UNIQUE ("workspaceId"), CONSTRAINT "UQ_b35a0ef2e2f0d40101dd7f161b9" UNIQUE ("stripeCustomerId"), CONSTRAINT "PK_5fffcd69bf722c297a3d5c3f3bc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."billingMeter_status_enum" AS ENUM('ACTIVE', 'INACTIVE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."billingMeter_eventtimewindow_enum" AS ENUM('DAY', 'HOUR')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."billingMeter" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "stripeMeterId" character varying NOT NULL, "displayName" character varying NOT NULL, "eventName" character varying NOT NULL, "status" "core"."billingMeter_status_enum" NOT NULL, "customerMapping" jsonb NOT NULL, "eventTimeWindow" "core"."billingMeter_eventtimewindow_enum", "valueSettings" jsonb NOT NULL, CONSTRAINT "UQ_340c08c4e5dd33cf963cbb133ae" UNIQUE ("stripeMeterId"), CONSTRAINT "PK_0bba5f7d2e3713332a0138ea1b3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."billingPrice_taxbehavior_enum" AS ENUM('EXCLUSIVE', 'INCLUSIVE', 'UNSPECIFIED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."billingPrice_type_enum" AS ENUM('ONE_TIME', 'RECURRING')`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."billingPrice_billingscheme_enum" AS ENUM('PER_UNIT', 'TIERED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."billingPrice_tiersmode_enum" AS ENUM('GRADUATED', 'VOLUME')`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."billingPrice_usagetype_enum" AS ENUM('METERED', 'LICENSED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."billingPrice_interval_enum" AS ENUM('day', 'month', 'week', 'year')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."billingPrice" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "stripePriceId" character varying NOT NULL, "active" boolean NOT NULL, "stripeProductId" character varying NOT NULL, "currency" character varying NOT NULL, "nickname" text, "taxBehavior" "core"."billingPrice_taxbehavior_enum" NOT NULL, "type" "core"."billingPrice_type_enum" NOT NULL, "billingScheme" "core"."billingPrice_billingscheme_enum" NOT NULL, "currencyOptions" jsonb, "tiers" jsonb, "recurring" jsonb, "transformQuantity" jsonb, "tiersMode" "core"."billingPrice_tiersmode_enum", "unitAmountDecimal" text, "unitAmount" numeric, "stripeMeterId" character varying, "usageType" "core"."billingPrice_usagetype_enum" NOT NULL, "interval" "core"."billingPrice_interval_enum", CONSTRAINT "UQ_f66d20a329f5f4b9d12afeae7d0" UNIQUE ("stripePriceId"), CONSTRAINT "PK_13927aef8d4e68e176a61c33d89" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."billingProduct" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "active" boolean NOT NULL, "description" text NOT NULL DEFAULT '', "name" character varying NOT NULL, "taxCode" text, "images" jsonb NOT NULL DEFAULT '[]', "marketingFeatures" jsonb NOT NULL DEFAULT '[]', "stripeProductId" character varying NOT NULL, "defaultStripePriceId" text, "metadata" jsonb NOT NULL DEFAULT '{}', "unitLabel" text, "url" text, CONSTRAINT "UQ_1ba1ba118792aa9eec92f132e82" UNIQUE ("stripeProductId"), CONSTRAINT "PK_8bb3c7be66db8e05476808b0ca7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."billingSubscriptionItem" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "billingSubscriptionId" uuid NOT NULL, "stripeSubscriptionId" character varying, "metadata" jsonb NOT NULL DEFAULT '{}', "billingThresholds" jsonb, "stripeProductId" character varying NOT NULL, "stripePriceId" character varying NOT NULL, "stripeSubscriptionItemId" character varying NOT NULL, "quantity" numeric, "hasReachedCurrentPeriodCap" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_6a989264cab5ee2d4b424e78526" UNIQUE ("stripeSubscriptionItemId"), CONSTRAINT "IDX_BILLING_SUBSCRIPTION_ITEM_BILLING_SUBSCRIPTION_ID_STRIPE_PRODUCT_ID_UNIQUE" UNIQUE ("billingSubscriptionId", "stripeProductId"), CONSTRAINT "PK_0287b2d9fca488edcbf748281fc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."billingSubscription_status_enum" AS ENUM('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'paused', 'trialing', 'unpaid')`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."billingSubscription_interval_enum" AS ENUM('day', 'month', 'week', 'year')`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."billingSubscription_collectionmethod_enum" AS ENUM('CHARGE_AUTOMATICALLY', 'SEND_INVOICE')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."billingSubscription" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "workspaceId" uuid NOT NULL, "stripeCustomerId" character varying NOT NULL, "stripeSubscriptionId" character varying NOT NULL, "status" "core"."billingSubscription_status_enum" NOT NULL, "interval" "core"."billingSubscription_interval_enum", "cancelAtPeriodEnd" boolean NOT NULL DEFAULT false, "currency" character varying NOT NULL DEFAULT 'USD', "currentPeriodEnd" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "currentPeriodStart" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "metadata" jsonb NOT NULL DEFAULT '{}', "cancelAt" TIMESTAMP WITH TIME ZONE, "canceledAt" TIMESTAMP WITH TIME ZONE, "automaticTax" jsonb, "cancellationDetails" jsonb, "collectionMethod" "core"."billingSubscription_collectionmethod_enum" NOT NULL DEFAULT 'CHARGE_AUTOMATICALLY', "endedAt" TIMESTAMP WITH TIME ZONE, "trialStart" TIMESTAMP WITH TIME ZONE, "trialEnd" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_1a858c28c7766d429cbd25f05e8" UNIQUE ("stripeSubscriptionId"), CONSTRAINT "PK_6e9c72c32d91640b8087cb53666" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_BILLING_SUBSCRIPTION_WORKSPACE_ID_UNIQUE" ON "core"."billingSubscription" ("workspaceId") WHERE status IN ('trialing', 'active', 'past_due')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingEntitlement" ADD CONSTRAINT "FK_766a1918aa3dbe0d67d3df62356" FOREIGN KEY ("stripeCustomerId") REFERENCES "core"."billingCustomer"("stripeCustomerId") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingCustomer" ADD CONSTRAINT "FK_53c2ef50e9611082f83d760897d" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" ADD CONSTRAINT "FK_d6eb2f6674a26736c8b2fa4ab11" FOREIGN KEY ("billingSubscriptionId") REFERENCES "core"."billingSubscription"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ADD CONSTRAINT "FK_0e793f67ed79fac873fb0eb30fb" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ADD CONSTRAINT "FK_6e7dda21d7fd1c0be7b3b07b3c4" FOREIGN KEY ("stripeCustomerId") REFERENCES "core"."billingCustomer"("stripeCustomerId") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" DROP CONSTRAINT "FK_6e7dda21d7fd1c0be7b3b07b3c4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" DROP CONSTRAINT "FK_0e793f67ed79fac873fb0eb30fb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" DROP CONSTRAINT "FK_d6eb2f6674a26736c8b2fa4ab11"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingCustomer" DROP CONSTRAINT "FK_53c2ef50e9611082f83d760897d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingEntitlement" DROP CONSTRAINT "FK_766a1918aa3dbe0d67d3df62356"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_BILLING_SUBSCRIPTION_WORKSPACE_ID_UNIQUE"`,
    );
    await queryRunner.query(`DROP TABLE "core"."billingSubscription"`);
    await queryRunner.query(
      `DROP TYPE "core"."billingSubscription_collectionmethod_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."billingSubscription_interval_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."billingSubscription_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "core"."billingSubscriptionItem"`);
    await queryRunner.query(`DROP TABLE "core"."billingProduct"`);
    await queryRunner.query(`DROP TABLE "core"."billingPrice"`);
    await queryRunner.query(`DROP TYPE "core"."billingPrice_interval_enum"`);
    await queryRunner.query(`DROP TYPE "core"."billingPrice_usagetype_enum"`);
    await queryRunner.query(`DROP TYPE "core"."billingPrice_tiersmode_enum"`);
    await queryRunner.query(
      `DROP TYPE "core"."billingPrice_billingscheme_enum"`,
    );
    await queryRunner.query(`DROP TYPE "core"."billingPrice_type_enum"`);
    await queryRunner.query(`DROP TYPE "core"."billingPrice_taxbehavior_enum"`);
    await queryRunner.query(`DROP TABLE "core"."billingMeter"`);
    await queryRunner.query(
      `DROP TYPE "core"."billingMeter_eventtimewindow_enum"`,
    );
    await queryRunner.query(`DROP TYPE "core"."billingMeter_status_enum"`);
    await queryRunner.query(`DROP TABLE "core"."billingCustomer"`);
    await queryRunner.query(`DROP TABLE "core"."billingEntitlement"`);
  }
}
