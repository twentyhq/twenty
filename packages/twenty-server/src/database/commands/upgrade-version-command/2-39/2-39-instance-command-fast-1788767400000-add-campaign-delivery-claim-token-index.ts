import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// Every batch send job releases its unsent claims in a finally block, filtering
// on workspaceId and claimToken alone. Without this index that is a sequential
// scan of the whole cross-tenant table once per batch. Partial, so it only
// covers the rows still holding a claim.
@RegisteredInstanceCommand('2.39.0', 1788767400000)
export class AddCampaignDeliveryClaimTokenIndexFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_CAMPAIGN_DELIVERY_CLAIM_TOKEN" ON "core"."campaignDelivery" ("workspaceId", "claimToken") WHERE "claimToken" IS NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "core"."IDX_CAMPAIGN_DELIVERY_CLAIM_TOKEN"`,
    );
  }
}
