import { type QueryRunner } from 'typeorm';

import { AddMetadataOverridesColumnFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-19/2-19-instance-command-fast-1782986475000-add-metadata-overrides-column';

describe('AddMetadataOverridesColumnFastInstanceCommand', () => {
  let command: AddMetadataOverridesColumnFastInstanceCommand;

  beforeEach(() => {
    command = new AddMetadataOverridesColumnFastInstanceCommand();
  });

  describe('up', () => {
    it('adds the overrides column to both tables without mutating data or dropping standardOverrides', async () => {
      const query = jest.fn().mockResolvedValue(undefined);
      const queryRunner = { query } as unknown as QueryRunner;

      await command.up(queryRunner);

      const statements = query.mock.calls.map((call) => call[0] as string);

      expect(statements).toEqual([
        'ALTER TABLE "core"."objectMetadata" ADD COLUMN IF NOT EXISTS "overrides" jsonb',
        'ALTER TABLE "core"."fieldMetadata" ADD COLUMN IF NOT EXISTS "overrides" jsonb',
      ]);
      expect(
        statements.some(
          (statement) =>
            statement.includes('UPDATE') || statement.includes('DROP COLUMN'),
        ),
      ).toBe(false);
    });
  });

  describe('down', () => {
    it('copies overrides back into standardOverrides before dropping the column', async () => {
      const query = jest.fn().mockResolvedValue(undefined);
      const queryRunner = { query } as unknown as QueryRunner;

      await command.down(queryRunner);

      const statements = query.mock.calls.map((call) => call[0] as string);

      expect(statements).toEqual([
        'UPDATE "core"."objectMetadata" SET "standardOverrides" = "overrides"',
        'ALTER TABLE "core"."objectMetadata" DROP COLUMN IF EXISTS "overrides"',
        'UPDATE "core"."fieldMetadata" SET "standardOverrides" = "overrides"',
        'ALTER TABLE "core"."fieldMetadata" DROP COLUMN IF EXISTS "overrides"',
      ]);
    });
  });
});
