import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.38.0', 1788862666171)
export class CreateBillingAppChargeFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const billingTables = await queryRunner.query(
      `SELECT 1 FROM pg_tables WHERE schemaname = 'core' AND tablename = 'billingCustomer'`,
    );
    if (billingTables.length === 0) return;
    await queryRunner.query('CREATE TABLE "core"."billingAppCharge" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "applicationId" uuid NOT NULL, "idempotencyKey" character varying(200) NOT NULL, "requestHash" character varying(64) NOT NULL, "usageRow" jsonb NOT NULL, "deliveredAt" TIMESTAMP WITH TIME ZONE, "nextAttemptAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_29e95ee664eb9b0bae34f2b11c0" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE INDEX "IDX_BILLING_APP_CHARGE_PENDING" ON "core"."billingAppCharge" ("deliveredAt", "nextAttemptAt") ');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_BILLING_APP_CHARGE_IDEMPOTENCY" ON "core"."billingAppCharge" ("workspaceId", "applicationId", "idempotencyKey") ');
    await queryRunner.query('ALTER TABLE "core"."billingAppCharge" ADD CONSTRAINT "FK_c24990be0160647a4c13eddb539" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const chargeTables = await queryRunner.query(
      `SELECT 1 FROM pg_tables WHERE schemaname = 'core' AND tablename = 'billingAppCharge'`,
    );
    if (chargeTables.length === 0) return;
    await queryRunner.query('ALTER TABLE "core"."billingAppCharge" DROP CONSTRAINT "FK_c24990be0160647a4c13eddb539"');
    await queryRunner.query('DROP INDEX "core"."IDX_BILLING_APP_CHARGE_IDEMPOTENCY"');
    await queryRunner.query('DROP INDEX "core"."IDX_BILLING_APP_CHARGE_PENDING"');
    await queryRunner.query('DROP TABLE "core"."billingAppCharge"');
  }
}
