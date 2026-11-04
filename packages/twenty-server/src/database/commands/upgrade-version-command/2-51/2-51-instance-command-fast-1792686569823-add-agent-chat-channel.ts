import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.51.0', 1792686569823)
export class AddAgentChatChannelFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TABLE "core"."agentChatChannel" ("workspaceId" uuid NOT NULL, "universalIdentifier" uuid NOT NULL, "applicationId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "icon" character varying, "color" character varying, "position" double precision NOT NULL DEFAULT \'0\', "isCustom" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_d74b9453b964418b53ca23f4d32" PRIMARY KEY ("id"))',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_19cf74c0bcf8386bbf43e11e22" ON "core"."agentChatChannel" ("workspaceId", "universalIdentifier") ',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_AGENT_CHAT_CHANNEL_NAME_WORKSPACE_ID_UNIQUE" ON "core"."agentChatChannel" ("name", "workspaceId") ',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_AGENT_CHAT_CHANNEL_WORKSPACE_ID_APPLICATION_ID" ON "core"."agentChatChannel" ("workspaceId", "applicationId") ',
    );
    await queryRunner.query(
      'CREATE TABLE "core"."agentChatChannelRole" ("workspaceId" uuid NOT NULL, "universalIdentifier" uuid NOT NULL, "applicationId" uuid NOT NULL, "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "channelId" uuid NOT NULL, "roleId" uuid NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "IDX_AGENT_CHAT_CHANNEL_ROLE_CHANNEL_ID_ROLE_ID_UNIQUE" UNIQUE ("channelId", "roleId"), CONSTRAINT "PK_121b99ba798cf59c70481400d47" PRIMARY KEY ("id"))',
    );
    await queryRunner.query(
      'CREATE UNIQUE INDEX "IDX_f8ef066c77d63992fa0d3bf65b" ON "core"."agentChatChannelRole" ("workspaceId", "universalIdentifier") ',
    );
    await queryRunner.query(
      'CREATE INDEX "IDX_AGENT_CHAT_CHANNEL_ROLE_WORKSPACE_ID_ROLE_ID" ON "core"."agentChatChannelRole" ("workspaceId", "roleId") ',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agentChatChannel" ADD CONSTRAINT "FK_06abd1f6b49da7e9d621edbb34d" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agentChatChannel" ADD CONSTRAINT "FK_60b86d8db38bff7ebf4b4e3167d" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agentChatChannelRole" ADD CONSTRAINT "FK_05411d9312a897a828ad3e749ce" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agentChatChannelRole" ADD CONSTRAINT "FK_5acd9b776da2f6cc9813d416c23" FOREIGN KEY ("applicationId") REFERENCES "core"."application"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agentChatChannelRole" ADD CONSTRAINT "FK_312b5b71997bc0556d4f8c489c6" FOREIGN KEY ("channelId") REFERENCES "core"."agentChatChannel"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agentChatChannelRole" ADD CONSTRAINT "FK_e01d14cd9ae854f33c70a6385da" FOREIGN KEY ("roleId") REFERENCES "core"."role"("id") ON DELETE CASCADE ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."role" ADD "canAccessAllAgentChatChannels" boolean NOT NULL DEFAULT false',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."role" DROP COLUMN "canAccessAllAgentChatChannels"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agentChatChannelRole" DROP CONSTRAINT "FK_e01d14cd9ae854f33c70a6385da"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agentChatChannelRole" DROP CONSTRAINT "FK_312b5b71997bc0556d4f8c489c6"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agentChatChannelRole" DROP CONSTRAINT "FK_5acd9b776da2f6cc9813d416c23"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agentChatChannelRole" DROP CONSTRAINT "FK_05411d9312a897a828ad3e749ce"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agentChatChannel" DROP CONSTRAINT "FK_60b86d8db38bff7ebf4b4e3167d"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agentChatChannel" DROP CONSTRAINT "FK_06abd1f6b49da7e9d621edbb34d"',
    );
    await queryRunner.query('DROP TABLE "core"."agentChatChannelRole"');
    await queryRunner.query('DROP TABLE "core"."agentChatChannel"');
  }
}
