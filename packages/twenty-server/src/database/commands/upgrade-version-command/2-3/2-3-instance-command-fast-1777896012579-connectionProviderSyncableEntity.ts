import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.3.0', 1777896012579)
export class ConnectionProviderSyncableEntityFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."applicationOAuthProvider" DROP CONSTRAINT "IDX_APP_OAUTH_PROVIDER_UNIVERSAL_ID_APPLICATION_UNIQUE"');
    await queryRunner.query('ALTER TABLE "core"."applicationOAuthProvider" ADD "deletedAt" TIMESTAMP WITH TIME ZONE');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_286647123520f69e611e19e383" ON "core"."applicationOAuthProvider" ("workspaceId", "universalIdentifier") ');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX "core"."IDX_286647123520f69e611e19e383"');
    await queryRunner.query('ALTER TABLE "core"."applicationOAuthProvider" DROP COLUMN "deletedAt"');
    await queryRunner.query('ALTER TABLE "core"."applicationOAuthProvider" ADD CONSTRAINT "IDX_APP_OAUTH_PROVIDER_UNIVERSAL_ID_APPLICATION_UNIQUE" UNIQUE ("applicationId", "universalIdentifier")');
  }
}
