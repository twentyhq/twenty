import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.53.0', 1793150000000)
export class AddMcpServerFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE TABLE "core"."mcpServer" ("workspaceId" uuid NOT NULL, "universalIdentifier" uuid NOT NULL, "applicationId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "label" character varying NOT NULL, "url" character varying NOT NULL, "connectionProviderId" uuid, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_467ff520c3aef4efa94e2b6afe6" PRIMARY KEY ("id"))');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_f4a467e03f28dfc5578531295e" ON "core"."mcpServer" ("workspaceId", "universalIdentifier") ');
    await queryRunner.query('CREATE INDEX "IDX_MCP_SERVER_CONNECTION_PROVIDER_ID" ON "core"."mcpServer" ("connectionProviderId") ');
    await queryRunner.query('CREATE UNIQUE INDEX "IDX_MCP_SERVER_WORKSPACE_ID_NAME_UNIQUE" ON "core"."mcpServer" ("workspaceId", "name") ');
    await queryRunner.query('ALTER TABLE "core"."mcpServer" ADD CONSTRAINT "FK_756acd9aa1352b9c60128bec232" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."mcpServer" ADD CONSTRAINT "FK_c0b38408081e8b6d0f661cd51fb" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
    await queryRunner.query('ALTER TABLE "core"."mcpServer" ADD CONSTRAINT "FK_b5eae743ed1d0658b26a73a79c6" FOREIGN KEY ("connectionProviderId") REFERENCES "core"."connectionProvider"("id") ON DELETE CASCADE ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."mcpServer" DROP CONSTRAINT "FK_b5eae743ed1d0658b26a73a79c6"');
    await queryRunner.query('ALTER TABLE "core"."mcpServer" DROP CONSTRAINT "FK_c0b38408081e8b6d0f661cd51fb"');
    await queryRunner.query('ALTER TABLE "core"."mcpServer" DROP CONSTRAINT "FK_756acd9aa1352b9c60128bec232"');
    await queryRunner.query('DROP INDEX "core"."IDX_MCP_SERVER_WORKSPACE_ID_NAME_UNIQUE"');
    await queryRunner.query('DROP INDEX "core"."IDX_MCP_SERVER_CONNECTION_PROVIDER_ID"');
    await queryRunner.query('DROP INDEX "core"."IDX_f4a467e03f28dfc5578531295e"');
    await queryRunner.query('DROP TABLE "core"."mcpServer"');
  }
}
