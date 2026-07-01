import { type QueryRunner } from 'typeorm';

import { UnifyMetadataOverridesFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-19/2-19-instance-command-fast-1820000100000-unify-metadata-overrides';

describe('UnifyMetadataOverridesFastInstanceCommand', () => {
  let command: UnifyMetadataOverridesFastInstanceCommand;

  beforeEach(() => {
    command = new UnifyMetadataOverridesFastInstanceCommand();
  });

  describe('up', () => {
    it('adds, backfills and drops the legacy column for both tables', async () => {
      const query = jest.fn().mockResolvedValue([{ count: 3 }]);
      const queryRunner = { query } as unknown as QueryRunner;

      await command.up(queryRunner);

      const statements = query.mock.calls.map((call) => call[0] as string);

      for (const table of ['objectMetadata', 'fieldMetadata']) {
        expect(statements).toEqual(
          expect.arrayContaining([
            expect.stringContaining(
              `ALTER TABLE "core"."${table}" ADD COLUMN IF NOT EXISTS "overrides" jsonb`,
            ),
            expect.stringContaining(
              `SET "overrides" = "standardOverrides"`,
            ),
            expect.stringContaining(
              `ALTER TABLE "core"."${table}" DROP COLUMN "standardOverrides"`,
            ),
          ]),
        );
      }
    });

    it('aborts when the isActive row count changes', async () => {
      const query = jest
        .fn()
        .mockResolvedValueOnce([{ count: 5 }]) // objectMetadata before
        .mockResolvedValueOnce(undefined) // ADD COLUMN
        .mockResolvedValueOnce(undefined) // DO backfill/drop
        .mockResolvedValueOnce([{ count: 4 }]); // objectMetadata after
      const queryRunner = { query } as unknown as QueryRunner;

      await expect(command.up(queryRunner)).rejects.toThrow(
        /"isActive" changed on "core"\."objectMetadata"/,
      );
    });
  });

  describe('down', () => {
    it('recreates and backfills standardOverrides, then drops overrides', async () => {
      const query = jest.fn().mockResolvedValue(undefined);
      const queryRunner = { query } as unknown as QueryRunner;

      await command.down(queryRunner);

      const statements = query.mock.calls.map((call) => call[0] as string);

      for (const table of ['objectMetadata', 'fieldMetadata']) {
        expect(statements).toEqual(
          expect.arrayContaining([
            `ALTER TABLE "core"."${table}" ADD COLUMN IF NOT EXISTS "standardOverrides" jsonb`,
            `UPDATE "core"."${table}" SET "standardOverrides" = "overrides" WHERE "overrides" IS NOT NULL`,
            `ALTER TABLE "core"."${table}" DROP COLUMN IF EXISTS "overrides"`,
          ]),
        );
      }
    });
  });
});
