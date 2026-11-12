import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.59.0', 1794507959766)
export class AddOauthDiscoveryToConnectionProviderFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "core"."connectionProviderOAuthClient" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "connectionProviderId" uuid NOT NULL, "registrationMethod" character varying NOT NULL, "clientId" character varying NOT NULL, "clientSecret" character varying, "clientSecretExpiresAt" TIMESTAMP WITH TIME ZONE, "tokenEndpointAuthMethod" character varying, "redirectUri" character varying NOT NULL, "discoveryState" jsonb NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_connectionProviderOAuthClient_clientSecret_encrypted" CHECK ("clientSecret" IS NULL OR "clientSecret" LIKE \'enc:v2:%\'), CONSTRAINT "PK_378876ac9fa9e1d9177a7f2c790" PRIMARY KEY ("id"))',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_CONNECTION_PROVIDER_OAUTH_CLIENT_PROVIDER_ID_UNIQUE" ON "core"."connectionProviderOAuthClient" ("connectionProviderId") ',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."connectionProvider" ADD "oauthDiscoveryConfig" jsonb',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."connectionProviderOAuthClient" ADD CONSTRAINT "FK_d8672886fdf748c49a458f5da8c" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."connectionProviderOAuthClient" ADD CONSTRAINT "FK_743610267fa3f2e1bfd67f75cf3" FOREIGN KEY ("connectionProviderId") REFERENCES "core"."connectionProvider"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."connectionProviderOAuthClient" DROP CONSTRAINT "FK_743610267fa3f2e1bfd67f75cf3"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."connectionProviderOAuthClient" DROP CONSTRAINT "FK_d8672886fdf748c49a458f5da8c"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."connectionProvider" DROP COLUMN "oauthDiscoveryConfig"',
    );
    await queryRunner.query(
      'DROP INDEX "core"."IDX_CONNECTION_PROVIDER_OAUTH_CLIENT_PROVIDER_ID_UNIQUE"',
    );
    await queryRunner.query(
      'DROP TABLE "core"."connectionProviderOAuthClient"',
    );
  }
}
