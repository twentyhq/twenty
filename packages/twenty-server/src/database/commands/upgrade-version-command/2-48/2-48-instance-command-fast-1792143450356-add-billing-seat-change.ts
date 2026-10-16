import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.48.0', 1792143450356)
export class AddBillingSeatChangeFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const billingSchema = await queryRunner.query(
      `SELECT 1 FROM pg_tables WHERE schemaname = 'core' AND tablename = 'billingCustomer'`,
    );

    if (billingSchema.length === 0) {
      return;
    }

    await queryRunner.query(
      'CREATE TABLE "core"."billingSeatChange" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "billingSubscriptionId" uuid NOT NULL, "previousSeats" integer NOT NULL, "seats" integer NOT NULL, "changedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "stripeEventId" character varying NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_dc320443aeca0926993cbe5fa1b" PRIMARY KEY ("id"))',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_BILLING_SEAT_CHANGE_STRIPE_EVENT_ID_UNIQUE" ON "core"."billingSeatChange" ("stripeEventId") ',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_BILLING_SEAT_CHANGE_WORKSPACE_ID_CHANGED_AT" ON "core"."billingSeatChange" ("workspaceId", "changedAt") ',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."billingSeatChange" ADD CONSTRAINT "FK_7a5578ea70c01bb7b232fddafda" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."billingSeatChange" ADD CONSTRAINT "FK_6e298ba2f63cf37eba65b1ca083" FOREIGN KEY ("billingSubscriptionId") REFERENCES "core"."billingSubscription"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE IF EXISTS "core"."billingSeatChange"');
  }
}
