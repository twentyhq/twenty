import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.55.0', 1793381202866)
export class CreateBillingArrangementTableFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Billing entities only load when billing is enabled
    const isBillingSchemaPresent = await queryRunner.query(
      `SELECT 1 FROM pg_tables WHERE schemaname = 'core' AND tablename = 'billingCustomer'`,
    );

    if (isBillingSchemaPresent.length === 0) {
      return;
    }

    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "core"."billingArrangement_type_enum" AS ENUM ('COMMITTED_SEATS', 'FREE_SEATS', 'STRIPE_COUPON', 'TRIAL_EXTENSION', 'WORKSPACE_CREDIT_ALLOWANCE', 'USER_CREDIT_ALLOWANCE', 'LIMIT_OVERRIDE', 'REFUND', 'CREDIT_GRANT'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    );

    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "core"."billingArrangement_seatcapmode_enum" AS ENUM ('SOFT', 'HARD'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    );

    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "core"."billingArrangement" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "workspaceId" uuid NOT NULL,
        "type" "core"."billingArrangement_type_enum" NOT NULL,
        "label" character varying(100) NOT NULL,
        "comment" character varying(500),
        "seats" integer,
        "seatCapMode" "core"."billingArrangement_seatcapmode_enum",
        "stripePriceId" character varying,
        "stripeCouponId" character varying,
        "creditAllowanceMicro" bigint,
        "stripeCreditNoteId" character varying,
        "creditGrantId" uuid,
        "usageLimitId" uuid,
        "startsAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "endsAt" TIMESTAMP WITH TIME ZONE,
        "revokedAt" TIMESTAMP WITH TIME ZONE,
        "revokedByUserId" uuid,
        "grantedByUserId" uuid,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_9451bfacd03125c95a4a60a4e63" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_BILLING_ARRANGEMENT_WORKSPACE_ID_TYPE"
        ON "core"."billingArrangement" ("workspaceId", "type")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."billingArrangement"`);

    await queryRunner.query(
      `DROP TYPE IF EXISTS "core"."billingArrangement_seatcapmode_enum"`,
    );

    await queryRunner.query(
      `DROP TYPE IF EXISTS "core"."billingArrangement_type_enum"`,
    );
  }
}
