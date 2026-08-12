import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// Creates core."billingCreditGrant" backing BillingCreditGrantEntity.
// Constraint names reproduce the ones TypeORM generated for this entity so the
// entity and the table stay in sync. Trimmed from the output of
//   npx nx run twenty-server:database:migrate:generate --name create-billing-credit-grant-table --type fast
// which also reported pre-existing drift on other billing tables, left alone
// here on purpose.
@RegisteredInstanceCommand('2.31.0', 1786458027000)
export class CreateBillingCreditGrantTableFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Billing entities only exist when billing is enabled, so an instance
    // without billing must not grow a billing table its entity set has no
    // counterpart for.
    const isBillingSchemaPresent = await queryRunner.query(
      `SELECT 1 FROM pg_tables WHERE schemaname = 'core' AND tablename = 'billingCustomer'`,
    );

    if (isBillingSchemaPresent.length === 0) {
      return;
    }

    await queryRunner.query(
      `DO $$ BEGIN CREATE TYPE "core"."billingCreditGrant_type_enum" AS ENUM ('ROLLOVER', 'ONBOARDING_REWARD', 'COMPENSATION', 'SALES'); EXCEPTION WHEN duplicate_object THEN null; END $$`,
    );

    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "core"."billingCreditGrant" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "workspaceId" uuid NOT NULL,
        "amountMicro" bigint NOT NULL,
        "type" "core"."billingCreditGrant_type_enum" NOT NULL,
        "effectiveAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "revokedAt" TIMESTAMP WITH TIME ZONE,
        "revokedByUserId" uuid,
        "grantedByUserId" uuid,
        "reason" character varying(500),
        "idempotencyKey" character varying,
        "sourceGrantId" uuid,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_eef2376084c6ef14cf8a6ffb3c4" PRIMARY KEY ("id"),
        CONSTRAINT "FK_e516eeab5b1dda05b823f235041" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )`,
    );

    // Nulls never conflict in a Postgres unique index, so grants without an
    // idempotency key are unconstrained.
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_BILLING_CREDIT_GRANT_IDEMPOTENCY_KEY_UNIQUE"
        ON "core"."billingCreditGrant" ("idempotencyKey")`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_BILLING_CREDIT_GRANT_WORKSPACE_ID_EXPIRES_AT"
        ON "core"."billingCreditGrant" ("workspaceId", "expiresAt")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."billingCreditGrant"`);

    // After the table, which depends on it. Leaving it behind would make a
    // later re-run reuse the old value set rather than create the current one.
    await queryRunner.query(
      `DROP TYPE IF EXISTS "core"."billingCreditGrant_type_enum"`,
    );
  }
}
