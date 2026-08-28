import { QueryRunner } from 'typeorm';

import { isCoreTablePresent } from 'src/database/commands/upgrade-version-command/2-38/utils/is-core-table-present.util';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// The GraphQL field of the same name is derived from the live credit balance in
// BillingSubscriptionItemResolver; the column has been neither read nor written
// since 2.32 and was only kept so a rollback to 2.31 still ran.
@RegisteredInstanceCommand('2.38.0', 1787906740819)
export class DropHasReachedCurrentPeriodCapFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await isCoreTablePresent(queryRunner, 'billingSubscriptionItem'))) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" DROP COLUMN IF EXISTS "hasReachedCurrentPeriodCap"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (!(await isCoreTablePresent(queryRunner, 'billingSubscriptionItem'))) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" ADD COLUMN IF NOT EXISTS "hasReachedCurrentPeriodCap" boolean NOT NULL DEFAULT false`,
    );
  }
}
