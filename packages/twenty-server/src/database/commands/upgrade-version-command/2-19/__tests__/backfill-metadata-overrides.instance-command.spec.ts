import { type DataSource } from 'typeorm';

import { BackfillMetadataOverridesSlowInstanceCommand } from 'src/database/commands/upgrade-version-command/2-19/2-19-instance-command-slow-1782986476000-backfill-metadata-overrides';

describe('BackfillMetadataOverridesSlowInstanceCommand', () => {
  let command: BackfillMetadataOverridesSlowInstanceCommand;

  beforeEach(() => {
    command = new BackfillMetadataOverridesSlowInstanceCommand();
  });

  describe('runDataMigration', () => {
    it('copies standardOverrides into overrides for both tables', async () => {
      const query = jest.fn().mockResolvedValue([{ count: 3 }]);
      const dataSource = { query } as unknown as DataSource;

      await command.runDataMigration(dataSource);

      const statements = query.mock.calls.map((call) => call[0] as string);

      for (const table of ['objectMetadata', 'fieldMetadata']) {
        expect(statements).toEqual(
          expect.arrayContaining([
            expect.stringContaining(
              `UPDATE "core"."${table}" SET "overrides" = "standardOverrides"`,
            ),
          ]),
        );
      }
    });

    it('aborts when the isActive row count changes', async () => {
      const query = jest
        .fn()
        .mockResolvedValueOnce([{ count: 5 }]) // objectMetadata before
        .mockResolvedValueOnce(undefined) // UPDATE backfill
        .mockResolvedValueOnce([{ count: 4 }]); // objectMetadata after
      const dataSource = { query } as unknown as DataSource;

      await expect(command.runDataMigration(dataSource)).rejects.toThrow(
        /"isActive" changed on "core"\."objectMetadata"/,
      );
    });
  });
});
