import { type QueryRunner } from 'typeorm';

import { AddLastStreamErrorToAgentChatThreadFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-19/2-19-instance-command-fast-1782996657000-add-last-stream-error-to-agent-chat-thread';

describe('AddLastStreamErrorToAgentChatThreadFastInstanceCommand', () => {
  let command: AddLastStreamErrorToAgentChatThreadFastInstanceCommand;

  beforeEach(() => {
    command = new AddLastStreamErrorToAgentChatThreadFastInstanceCommand();
  });

  describe('up', () => {
    it('adds the lastStreamError column without mutating data', async () => {
      const query = jest.fn().mockResolvedValue(undefined);
      const queryRunner = { query } as unknown as QueryRunner;

      await command.up(queryRunner);

      expect(query.mock.calls.map((call) => call[0] as string)).toEqual([
        'ALTER TABLE "core"."agentChatThread" ADD COLUMN IF NOT EXISTS "lastStreamError" jsonb',
      ]);
    });
  });

  describe('down', () => {
    it('drops the lastStreamError column', async () => {
      const query = jest.fn().mockResolvedValue(undefined);
      const queryRunner = { query } as unknown as QueryRunner;

      await command.down(queryRunner);

      expect(query.mock.calls.map((call) => call[0] as string)).toEqual([
        'ALTER TABLE "core"."agentChatThread" DROP COLUMN IF EXISTS "lastStreamError"',
      ]);
    });
  });
});
