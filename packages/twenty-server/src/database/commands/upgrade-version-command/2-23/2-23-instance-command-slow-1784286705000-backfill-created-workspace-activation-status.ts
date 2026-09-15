import { Logger } from '@nestjs/common';

import { DataSource, QueryRunner } from 'typeorm';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

const V2_ONBOARDING_RELEASE_DATE = '2026-07-01';

@RegisteredInstanceCommand('2.23.0', 1784286705000, { type: 'slow' })
export class BackfillCreatedWorkspaceActivationStatusSlowInstanceCommand
  implements SlowInstanceCommand
{
  private readonly logger = new Logger(
    BackfillCreatedWorkspaceActivationStatusSlowInstanceCommand.name,
  );

  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  async runDataMigration(dataSource: DataSource): Promise<void> {
    if (!this.twentyConfigService.get('IS_BILLING_ENABLED')) {
      return;
    }

    const backfilledWorkspaces: { id: string }[] = await dataSource.query(
      `UPDATE "core"."workspace" "workspace"
       SET "activationStatus" = 'CREATED'
       WHERE "workspace"."activationStatus" = 'ACTIVE'
         AND "workspace"."deletedAt" IS NULL
         AND "workspace"."createdAt" >= $1
         AND NOT EXISTS (
           SELECT 1
           FROM "core"."billingSubscription" "billingSubscription"
           WHERE "billingSubscription"."workspaceId" = "workspace"."id"
         )
       RETURNING "workspace"."id"`,
      [V2_ONBOARDING_RELEASE_DATE],
    );

    this.logger.log(
      `Backfilled ${backfilledWorkspaces.length} subscription-less active workspace(s) to CREATED`,
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {}

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
