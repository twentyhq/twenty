import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.39.0', 1788532564508)
export class AddUsageLimitValueTypeFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" ADD COLUMN "limitValueType" character varying NOT NULL DEFAULT 'absolute'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" ALTER COLUMN "limitValueType" DROP DEFAULT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "core"."usageLimit" WHERE "limitValueType" <> 'absolute' OR "periodUnit" = 'allowancePeriod'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."usageLimit" DROP COLUMN "limitValueType"`,
    );
  }
}
