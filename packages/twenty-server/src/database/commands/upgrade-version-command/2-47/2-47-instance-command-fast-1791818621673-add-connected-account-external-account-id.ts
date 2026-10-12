import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.47.0', 1791818621673)
export class AddConnectedAccountExternalAccountIdFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."connectedAccount" ADD "externalAccountId" character varying(512)',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_CONNECTED_ACCOUNT_APP_USER_EXTERNAL_ACCOUNT_UNIQUE" ON "core"."connectedAccount" ("workspaceId", "connectionProviderId", "userWorkspaceId", "externalAccountId") WHERE "provider" = \'app\' AND "visibility" = \'user\' AND "externalAccountId" IS NOT NULL AND "archivedAt" IS NULL',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_CONNECTED_ACCOUNT_APP_SHARED_EXTERNAL_ACCOUNT_UNIQUE" ON "core"."connectedAccount" ("workspaceId", "connectionProviderId", "externalAccountId") WHERE "provider" = \'app\' AND "visibility" = \'workspace\' AND "externalAccountId" IS NOT NULL AND "archivedAt" IS NULL',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP INDEX "core"."IDX_CONNECTED_ACCOUNT_APP_SHARED_EXTERNAL_ACCOUNT_UNIQUE"',
    );
    await queryRunner.query(
      'DROP INDEX "core"."IDX_CONNECTED_ACCOUNT_APP_USER_EXTERNAL_ACCOUNT_UNIQUE"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."connectedAccount" DROP COLUMN "externalAccountId"',
    );
  }
}
