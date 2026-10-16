import { QueryRunner } from 'typeorm';

import { isCoreTablePresent } from 'src/database/commands/upgrade-version-command/2-49/utils/is-core-table-present.util';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.49.0', 1792161059823)
export class AddPeriodPeakSeatsToBillingSubscriptionFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await isCoreTablePresent(queryRunner, 'billingSubscription'))) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ADD COLUMN IF NOT EXISTS "currentPeriodPeakSeats" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" ADD COLUMN IF NOT EXISTS "previousPeriodPeakSeats" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await isCoreTablePresent(queryRunner, 'billingSubscription'))) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" DROP COLUMN IF EXISTS "previousPeriodPeakSeats"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscription" DROP COLUMN IF EXISTS "currentPeriodPeakSeats"`,
    );
  }
}
