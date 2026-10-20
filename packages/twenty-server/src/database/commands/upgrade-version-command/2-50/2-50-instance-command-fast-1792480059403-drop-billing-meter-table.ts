import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.50.0', 1792480059403)
export class DropBillingMeterTableFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "core"."billingPrice" DROP COLUMN IF EXISTS "stripeMeterId"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "core"."billingMeter"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "core"."billingMeter_eventtimewindow_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "core"."billingMeter_status_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const billingPriceTables = await queryRunner.query(
      `SELECT 1 FROM pg_tables WHERE schemaname = 'core' AND tablename = 'billingPrice'`,
    );

    if (billingPriceTables.length === 0) {
      return;
    }

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
      `ALTER TABLE "core"."billingPrice" ADD COLUMN "stripeMeterId" character varying`,
    );
  }
}
