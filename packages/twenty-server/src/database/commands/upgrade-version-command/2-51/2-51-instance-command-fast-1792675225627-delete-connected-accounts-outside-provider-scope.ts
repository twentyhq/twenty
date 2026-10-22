import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.51.0', 1792675225627)
export class DeleteConnectedAccountsOutsideProviderScopeFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DELETE FROM "core"."connectedAccount" "connectedAccount" USING "core"."connectionProvider" "connectionProvider" WHERE "connectedAccount"."connectionProviderId" = "connectionProvider"."id" AND "connectedAccount"."scope" <> "connectionProvider"."scope"::text',
    );
  }

  public async down(): Promise<void> {
    return;
  }
}
