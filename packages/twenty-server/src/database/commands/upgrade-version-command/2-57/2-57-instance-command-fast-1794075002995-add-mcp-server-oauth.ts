import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.57.0', 1794075002995)
export class AddMcpServerOauthFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "core"."mcpServerOAuthClient" ("workspaceId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "mcpServerId" uuid NOT NULL, "registrationMethod" character varying NOT NULL, "clientId" character varying NOT NULL, "clientSecret" character varying, "clientSecretExpiresAt" TIMESTAMP WITH TIME ZONE, "tokenEndpointAuthMethod" character varying, "redirectUri" character varying NOT NULL, "discoveryState" jsonb NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_mcpServerOAuthClient_clientSecret_encrypted" CHECK ("clientSecret" IS NULL OR "clientSecret" LIKE \'enc:v2:%\'), CONSTRAINT "PK_759ac91b6491fcd2245be9cc5a4" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_MCP_SERVER_OAUTH_CLIENT_MCP_SERVER_ID_UNIQUE" ON "core"."mcpServerOAuthClient" ("mcpServerId") ');
    await queryRunner.query('ALTER TABLE "core"."connectedAccount" ADD "mcpServerId" uuid');
    await queryRunner.query('CREATE INDEX "IDX_CONNECTED_ACCOUNT_MCP_SERVER_ID" ON "core"."connectedAccount" ("mcpServerId") ');
    await queryRunner.query('ALTER TABLE "core"."connectedAccount" ADD CONSTRAINT "FK_b718448a3127a69857a39a57ee3" FOREIGN KEY ("mcpServerId") REFERENCES "core"."mcpServer"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."mcpServerOAuthClient" ADD CONSTRAINT "FK_396e56db064d6e6248c5167cfb9" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."mcpServerOAuthClient" ADD CONSTRAINT "FK_3d2e45a2d51c1169cd3588e4d46" FOREIGN KEY ("mcpServerId") REFERENCES "core"."mcpServer"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."mcpServerOAuthClient" DROP CONSTRAINT "FK_3d2e45a2d51c1169cd3588e4d46"');
    await queryRunner.query('ALTER TABLE "core"."mcpServerOAuthClient" DROP CONSTRAINT "FK_396e56db064d6e6248c5167cfb9"');
    await queryRunner.query('ALTER TABLE "core"."connectedAccount" DROP CONSTRAINT "FK_b718448a3127a69857a39a57ee3"');
    await queryRunner.query('DROP INDEX "core"."IDX_CONNECTED_ACCOUNT_MCP_SERVER_ID"');
    await queryRunner.query('ALTER TABLE "core"."connectedAccount" DROP COLUMN "mcpServerId"');
    await queryRunner.query('DROP INDEX "core"."IDX_MCP_SERVER_OAUTH_CLIENT_MCP_SERVER_ID_UNIQUE"');
    await queryRunner.query('DROP TABLE "core"."mcpServerOAuthClient"');
  }
}
