import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNewBillingStripeTables1733397937967
  implements MigrationInterface
{
  name = 'AddNewBillingStripeTables1733397937967';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "core"."billingCustomer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "workspaceId" uuid NOT NULL, "stripeCustomerId" character varying NOT NULL, CONSTRAINT "UQ_b35a0ef2e2f0d40101dd7f161b9" UNIQUE ("stripeCustomerId"), CONSTRAINT "IndexOnWorkspaceIdAndStripeCustomerIdUnique" UNIQUE ("workspaceId", "stripeCustomerId"), CONSTRAINT "PK_5fffcd69bf722c297a3d5c3f3bc" PRIMARY KEY ("id"))`,
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
      `CREATE TABLE "core"."billingProduct" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "deletedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "active" boolean NOT NULL, "description" text, "name" character varying NOT NULL, "taxCode" text, "images" jsonb NOT NULL DEFAULT '[]', "marketingFeatures" jsonb NOT NULL DEFAULT '[]', "stripeProductId" character varying NOT NULL, "defaultStripePriceId" text, "metadata" jsonb NOT NULL DEFAULT '{}', "unitLabel" text, "url" text, CONSTRAINT "UQ_1ba1ba118792aa9eec92f132e82" UNIQUE ("stripeProductId"), CONSTRAINT "PK_8bb3c7be66db8e05476808b0ca7" PRIMARY KEY ("id"))`,
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
      `ALTER TABLE "core"."billingSubscriptionItem" ADD "stripeSubscriptionId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" ADD "metadata" jsonb NOT NULL DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" ADD "billingThresholds" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ADD "cancelAtPeriodEnd" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ADD "currency" character varying NOT NULL DEFAULT 'USD'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ADD "currentPeriodEnd" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ADD "currentPeriodStart" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ADD "metadata" jsonb NOT NULL DEFAULT '{}'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ADD "cancelAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ADD "canceledAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ADD "automaticTax" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ADD "cancellationDetails" jsonb`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."billingSubscription_collectionmethod_enum" AS ENUM('CHARGE_AUTOMATICALLY', 'SEND_INVOICE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ADD "collectionMethod" "core"."billingSubscription_collectionmethod_enum" NOT NULL DEFAULT 'CHARGE_AUTOMATICALLY'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ADD "endedAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ADD "trialStart" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ADD "trialEnd" TIMESTAMP WITH TIME ZONE`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."billingCustomer" ADD CONSTRAINT "FK_53c2ef50e9611082f83d760897d" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `ALTER TABLE "core"."billingPrice" ADD CONSTRAINT "FK_4d57ee4dbfc8b4075eb24026fca" FOREIGN KEY ("stripeProductId") REFERENCES "core"."billingProduct"("stripeProductId") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingPrice" ADD CONSTRAINT "FK_c8b4375b7bf8724ba54065372e1" FOREIGN KEY ("stripeMeterId") REFERENCES "core"."billingMeter"("stripeMeterId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingPrice" DROP CONSTRAINT "FK_c8b4375b7bf8724ba54065372e1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingPrice" DROP CONSTRAINT "FK_4d57ee4dbfc8b4075eb24026fca"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingCustomer" DROP CONSTRAINT "FK_53c2ef50e9611082f83d760897d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" DROP COLUMN "trialEnd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" DROP COLUMN "trialStart"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" DROP COLUMN "endedAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" DROP COLUMN "collectionMethod"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."billingSubscription_collectionmethod_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" DROP COLUMN "cancellationDetails"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" DROP COLUMN "automaticTax"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" DROP COLUMN "canceledAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" DROP COLUMN "cancelAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" DROP COLUMN "metadata"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" DROP COLUMN "currentPeriodStart"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" DROP COLUMN "currentPeriodEnd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" DROP COLUMN "currency"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" DROP COLUMN "cancelAtPeriodEnd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" DROP COLUMN "billingThresholds"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" DROP COLUMN "metadata"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" DROP COLUMN "stripeSubscriptionId"`,
    );
    await queryRunner.query(`DROP TABLE "core"."billingPrice"`);
    await queryRunner.query(`DROP TYPE "core"."billingPrice_interval_enum"`);
    await queryRunner.query(`DROP TYPE "core"."billingPrice_usagetype_enum"`);
    await queryRunner.query(`DROP TYPE "core"."billingPrice_tiersmode_enum"`);
    await queryRunner.query(
      `DROP TYPE "core"."billingPrice_billingscheme_enum"`,
    );
    await queryRunner.query(`DROP TYPE "core"."billingPrice_type_enum"`);
    await queryRunner.query(`DROP TYPE "core"."billingPrice_taxbehavior_enum"`);
    await queryRunner.query(`DROP TABLE "core"."billingProduct"`);
    await queryRunner.query(`DROP TABLE "core"."billingMeter"`);
    await queryRunner.query(
      `DROP TYPE "core"."billingMeter_eventtimewindow_enum"`,
    );
    await queryRunner.query(`DROP TYPE "core"."billingMeter_status_enum"`);
    await queryRunner.query(`DROP TABLE "core"."billingCustomer"`);
  }
}
