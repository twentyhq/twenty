import { type QueryRunner } from 'typeorm';

import { DropMetadataStandardOverridesColumnFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-20/2-20-instance-command-fast-1825000000000-drop-metadata-standard-overrides-column';

describe('DropMetadataStandardOverridesColumnFastInstanceCommand', () => {
  let command: DropMetadataStandardOverridesColumnFastInstanceCommand;

  beforeEach(() => {
    command = new DropMetadataStandardOverridesColumnFastInstanceCommand();
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

      for (const table of ['objectMetadata', 'fieldMetadata']) {
        expect(statements).toEqual(
          expect.arrayContaining([
            `ALTER TABLE "core"."${table}" ADD COLUMN IF NOT EXISTS "standardOverrides" jsonb`,
            `UPDATE "core"."${table}" SET "standardOverrides" = "overrides" WHERE "overrides" IS NOT NULL`,
          ]),
        );
      }
    });
  });
});
