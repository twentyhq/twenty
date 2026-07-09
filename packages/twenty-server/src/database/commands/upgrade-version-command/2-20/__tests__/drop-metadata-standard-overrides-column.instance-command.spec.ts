import { type QueryRunner } from 'typeorm';

import { DropMetadataStandardOverridesColumnFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-20/2-20-instance-command-fast-1783511477234-drop-metadata-standard-overrides-column';
import { DROP_METADATA_STANDARD_OVERRIDES_COLUMN_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-20/drop-metadata-standard-overrides-column-upgrade-command-name.constant';
import { getRegisteredInstanceCommandMetadata } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';

describe('DropMetadataStandardOverridesColumnFastInstanceCommand', () => {
  let command: DropMetadataStandardOverridesColumnFastInstanceCommand;

  beforeEach(() => {
    command = new DropMetadataStandardOverridesColumnFastInstanceCommand();
  });

  describe('registration', () => {
    it('is registered against 2.20.0 so it stays dormant until 2.20 is current', () => {
      const metadata = getRegisteredInstanceCommandMetadata(
        DropMetadataStandardOverridesColumnFastInstanceCommand,
      );

      expect(metadata).toEqual({
        version: '2.20.0',
        timestamp: 1783511477234,
        type: 'fast',
      });
    });

    it('has a name constant matching its computed registered name', () => {
      const metadata = getRegisteredInstanceCommandMetadata(
        DropMetadataStandardOverridesColumnFastInstanceCommand,
      );

      expect(
        `${metadata?.version}_${DropMetadataStandardOverridesColumnFastInstanceCommand.name}_${metadata?.timestamp}`,
      ).toBe(DROP_METADATA_STANDARD_OVERRIDES_COLUMN_UPGRADE_COMMAND_NAME);
    });
  });

  describe('up', () => {
    it('drops standardOverrides from both tables', async () => {
      const query = jest.fn().mockResolvedValue(undefined);
      const queryRunner = { query } as unknown as QueryRunner;

      await command.up(queryRunner);

      const statements = query.mock.calls.map((call) => call[0] as string);

      expect(statements).toEqual([
        'ALTER TABLE "core"."objectMetadata" DROP COLUMN IF EXISTS "standardOverrides"',
        'ALTER TABLE "core"."fieldMetadata" DROP COLUMN IF EXISTS "standardOverrides"',
      ]);
    });
  });

  describe('down', () => {
    it('recreates and backfills standardOverrides from overrides', async () => {
      const query = jest.fn().mockResolvedValue(undefined);
      const queryRunner = { query } as unknown as QueryRunner;

      await command.down(queryRunner);

      const statements = query.mock.calls.map((call) => call[0] as string);

      expect(statements).toEqual([
        'ALTER TABLE "core"."objectMetadata" ADD COLUMN IF NOT EXISTS "standardOverrides" jsonb',
        'UPDATE "core"."objectMetadata" SET "standardOverrides" = "overrides"',
        'ALTER TABLE "core"."fieldMetadata" ADD COLUMN IF NOT EXISTS "standardOverrides" jsonb',
        'UPDATE "core"."fieldMetadata" SET "standardOverrides" = "overrides"',
      ]);
    });
  });
});
