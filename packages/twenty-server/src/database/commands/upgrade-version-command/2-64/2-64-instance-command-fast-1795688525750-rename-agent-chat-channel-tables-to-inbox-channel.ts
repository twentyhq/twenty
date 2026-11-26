import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.64.0', 1795688525750)
export class RenameAgentChatChannelTablesToInboxChannelFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."agentChatChannel" RENAME TO "inboxChannel"',
    );
    await queryRunner.query(
      'ALTER INDEX "core"."IDX_AGENT_CHAT_CHANNEL_WORKSPACE_ID_APPLICATION_ID" RENAME TO "IDX_INBOX_CHANNEL_WORKSPACE_ID_APPLICATION_ID"',
    );
    await queryRunner.query(
      'ALTER INDEX "core"."IDX_AGENT_CHAT_CHANNEL_NAME_WORKSPACE_ID_UNIQUE" RENAME TO "IDX_INBOX_CHANNEL_NAME_WORKSPACE_ID_UNIQUE"',
    );
    await queryRunner.query(
      'ALTER INDEX "core"."IDX_19cf74c0bcf8386bbf43e11e22" RENAME TO "IDX_f11a2bd3c42d7b0029a0a86b4e"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."inboxChannel" RENAME CONSTRAINT "PK_d74b9453b964418b53ca23f4d32" TO "PK_a570ab7616b39552c297c2daddd"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."inboxChannel" RENAME CONSTRAINT "FK_06abd1f6b49da7e9d621edbb34d" TO "FK_d26faee0a06f1c49c345daf8a10"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."inboxChannel" RENAME CONSTRAINT "FK_60b86d8db38bff7ebf4b4e3167d" TO "FK_6cdb6b47e76f848b39187537b75"',
    );
    // TODO(@bosiraphael): drop the agentChatChannel and agentChatChannelRole views in the next version, they only keep pods still on the pre-rename code working during the rollout
    await queryRunner.query(
      'CREATE VIEW "core"."agentChatChannel" AS SELECT * FROM "core"."inboxChannel"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agentChatChannelRole" RENAME TO "inboxChannelRole"',
    );
    await queryRunner.query(
      'ALTER INDEX "core"."IDX_AGENT_CHAT_CHANNEL_ROLE_WORKSPACE_ID_ROLE_ID" RENAME TO "IDX_INBOX_CHANNEL_ROLE_WORKSPACE_ID_ROLE_ID"',
    );
    await queryRunner.query(
      'ALTER INDEX "core"."IDX_f8ef066c77d63992fa0d3bf65b" RENAME TO "IDX_4eea2c10eb2a6a6e5839d0987a"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."inboxChannelRole" RENAME CONSTRAINT "IDX_AGENT_CHAT_CHANNEL_ROLE_CHANNEL_ID_ROLE_ID_UNIQUE" TO "IDX_INBOX_CHANNEL_ROLE_CHANNEL_ID_ROLE_ID_UNIQUE"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."inboxChannelRole" RENAME CONSTRAINT "PK_121b99ba798cf59c70481400d47" TO "PK_2bea545f62e5434fdc3dfda3da3"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."inboxChannelRole" RENAME CONSTRAINT "FK_05411d9312a897a828ad3e749ce" TO "FK_987bd8b84ec127f3208df37e477"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."inboxChannelRole" RENAME CONSTRAINT "FK_5acd9b776da2f6cc9813d416c23" TO "FK_ca1a19a2fcc9b9c2b58c6545ac0"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."inboxChannelRole" RENAME CONSTRAINT "FK_312b5b71997bc0556d4f8c489c6" TO "FK_8ede01641e201bc014d9a949608"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."inboxChannelRole" RENAME CONSTRAINT "FK_e01d14cd9ae854f33c70a6385da" TO "FK_677196b81c3755d7a4fb432a97c"',
    );
    await queryRunner.query(
      'CREATE VIEW "core"."agentChatChannelRole" AS SELECT * FROM "core"."inboxChannelRole"',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP VIEW "core"."agentChatChannelRole"');
    await queryRunner.query(
      'ALTER TABLE "core"."inboxChannelRole" RENAME CONSTRAINT "FK_677196b81c3755d7a4fb432a97c" TO "FK_e01d14cd9ae854f33c70a6385da"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."inboxChannelRole" RENAME CONSTRAINT "FK_8ede01641e201bc014d9a949608" TO "FK_312b5b71997bc0556d4f8c489c6"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."inboxChannelRole" RENAME CONSTRAINT "FK_ca1a19a2fcc9b9c2b58c6545ac0" TO "FK_5acd9b776da2f6cc9813d416c23"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."inboxChannelRole" RENAME CONSTRAINT "FK_987bd8b84ec127f3208df37e477" TO "FK_05411d9312a897a828ad3e749ce"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."inboxChannelRole" RENAME CONSTRAINT "PK_2bea545f62e5434fdc3dfda3da3" TO "PK_121b99ba798cf59c70481400d47"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."inboxChannelRole" RENAME CONSTRAINT "IDX_INBOX_CHANNEL_ROLE_CHANNEL_ID_ROLE_ID_UNIQUE" TO "IDX_AGENT_CHAT_CHANNEL_ROLE_CHANNEL_ID_ROLE_ID_UNIQUE"',
    );
    await queryRunner.query(
      'ALTER INDEX "core"."IDX_4eea2c10eb2a6a6e5839d0987a" RENAME TO "IDX_f8ef066c77d63992fa0d3bf65b"',
    );
    await queryRunner.query(
      'ALTER INDEX "core"."IDX_INBOX_CHANNEL_ROLE_WORKSPACE_ID_ROLE_ID" RENAME TO "IDX_AGENT_CHAT_CHANNEL_ROLE_WORKSPACE_ID_ROLE_ID"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."inboxChannelRole" RENAME TO "agentChatChannelRole"',
    );
    await queryRunner.query('DROP VIEW "core"."agentChatChannel"');
    await queryRunner.query(
      'ALTER TABLE "core"."inboxChannel" RENAME CONSTRAINT "FK_6cdb6b47e76f848b39187537b75" TO "FK_60b86d8db38bff7ebf4b4e3167d"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."inboxChannel" RENAME CONSTRAINT "FK_d26faee0a06f1c49c345daf8a10" TO "FK_06abd1f6b49da7e9d621edbb34d"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."inboxChannel" RENAME CONSTRAINT "PK_a570ab7616b39552c297c2daddd" TO "PK_d74b9453b964418b53ca23f4d32"',
    );
    await queryRunner.query(
      'ALTER INDEX "core"."IDX_f11a2bd3c42d7b0029a0a86b4e" RENAME TO "IDX_19cf74c0bcf8386bbf43e11e22"',
    );
    await queryRunner.query(
      'ALTER INDEX "core"."IDX_INBOX_CHANNEL_NAME_WORKSPACE_ID_UNIQUE" RENAME TO "IDX_AGENT_CHAT_CHANNEL_NAME_WORKSPACE_ID_UNIQUE"',
    );
    await queryRunner.query(
      'ALTER INDEX "core"."IDX_INBOX_CHANNEL_WORKSPACE_ID_APPLICATION_ID" RENAME TO "IDX_AGENT_CHAT_CHANNEL_WORKSPACE_ID_APPLICATION_ID"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."inboxChannel" RENAME TO "agentChatChannel"',
    );
  }
}
