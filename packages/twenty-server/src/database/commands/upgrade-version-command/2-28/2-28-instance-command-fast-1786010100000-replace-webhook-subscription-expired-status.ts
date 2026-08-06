import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

const TABLES = ['calendarChannel', 'messageChannel'] as const;

@RegisteredInstanceCommand('2.28.0', 1786010100000)
export class ReplaceWebhookSubscriptionExpiredStatusFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const table of TABLES) {
      const enumType = `"core"."${table}_webhooksubscriptionstatus_enum"`;
      const oldEnumType = `"core"."${table}_webhooksubscriptionstatus_enum_old"`;

      await queryRunner.query(
        `ALTER TYPE ${enumType} RENAME TO "${table}_webhooksubscriptionstatus_enum_old"`,
      );
      await queryRunner.query(
        `CREATE TYPE ${enumType} AS ENUM('PENDING', 'ACTIVE', 'FAILED', 'FAILED_INSUFFICIENT_PERMISSIONS', 'FAILED_UNKNOWN')`,
      );
      await queryRunner.query(
        `ALTER TABLE "core"."${table}" ALTER COLUMN "webhookSubscriptionStatus" TYPE ${enumType} USING (CASE WHEN "webhookSubscriptionStatus"::text = 'EXPIRED' THEN 'FAILED_INSUFFICIENT_PERMISSIONS' ELSE "webhookSubscriptionStatus"::text END)::${enumType}`,
      );
      await queryRunner.query(`DROP TYPE ${oldEnumType}`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of TABLES) {
      const enumType = `"core"."${table}_webhooksubscriptionstatus_enum"`;
      const oldEnumType = `"core"."${table}_webhooksubscriptionstatus_enum_old"`;

      await queryRunner.query(
        `ALTER TYPE ${enumType} RENAME TO "${table}_webhooksubscriptionstatus_enum_old"`,
      );
      await queryRunner.query(
        `CREATE TYPE ${enumType} AS ENUM('PENDING', 'ACTIVE', 'FAILED', 'EXPIRED')`,
      );
      await queryRunner.query(
        `ALTER TABLE "core"."${table}" ALTER COLUMN "webhookSubscriptionStatus" TYPE ${enumType} USING (CASE WHEN "webhookSubscriptionStatus"::text IN ('FAILED_INSUFFICIENT_PERMISSIONS', 'FAILED_UNKNOWN') THEN 'EXPIRED' ELSE "webhookSubscriptionStatus"::text END)::${enumType}`,
      );
      await queryRunner.query(`DROP TYPE ${oldEnumType}`);
    }
  }
}
