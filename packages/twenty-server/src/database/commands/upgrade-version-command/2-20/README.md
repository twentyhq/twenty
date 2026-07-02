# 2.20 — pending metadata-override cleanup

The `standardOverrides` column on `objectMetadata` and `fieldMetadata` is a
**deferred drop**. As of 2.19 the column is:

- superseded by `overrides` (backfilled by
  `../2-19/2-19-instance-command-slow-1820000110000-backfill-metadata-overrides.ts`),
- excluded from the flat-entity / registry via the `WasRemovedInUpgrade<T>` type
  wrapper on both entities,
- still physically present in the database, so a 2.18 → 2.19 rolling deploy never
  breaks the previous release's pods, which still `SELECT "standardOverrides"`.

The physical `DROP COLUMN` is intentionally deferred to the next release (2.20):
by the time it runs, every pod is on a release that reads/writes `overrides`
only. This folder holds the ready-to-wire drop command so whoever opens the 2.20
upgrade work can drop it in.

## Why it isn't wired up yet

`2.20.0` is not in `TWENTY_CROSS_UPGRADE_SUPPORTED_VERSIONS` (currently
`[...TWENTY_PREVIOUS_VERSIONS, TWENTY_CURRENT_VERSION]`, and current is 2.19.0).
Registering a 2.20 instance command — or pointing the entity's
`@WasRemovedInUpgrade` decorator at a 2.20 command name — would fail boot
validation (`unknown-step-name`) until 2.20 is the current version. So the
command lives here as documentation, not as compiled code.

## Activation checklist (when 2.20 becomes the current version)

1. Create `2-20-instance-command-fast-<timestamp>-drop-metadata-standard-overrides-column.ts`
   in this folder with the command below. Regenerate `<timestamp>` (the value
   here is a placeholder) so ordering against other 2.20 commands is correct.
2. Register it in
   `../instance-commands.constant.ts` (import + add to the array).
3. Add the drop decorator to `standardOverrides` on **both**
   `object-metadata.entity.ts` and `field-metadata.entity.ts`:
   `@WasRemovedInUpgrade({ upgradeCommandName: DROP_METADATA_STANDARD_OVERRIDES_COLUMN_UPGRADE_COMMAND_NAME })`,
   and add the matching constant
   (`'2.20.0_DropMetadataStandardOverridesColumnFastInstanceCommand_<timestamp>'`),
   mirroring how `isCustom` pairs its decorator with a command name.
4. Add the test below under `2-20/__tests__/`.
5. Run `database:migrate:generate --name pending-migration-check` and confirm no
   drift, then run the integration suite.

## Command

```ts
import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// Phase 2 of unifying the metadata override mechanisms. Drops the legacy
// "standardOverrides" column now that every pod runs a release which reads and
// writes "overrides" (backfilled in 2.19). Runs only once the instance reaches
// 2.20, so the 2.19 rolling deploy keeps the column available for older pods.
// down() restores the column and copies the blob back from "overrides".
const TABLES = ['objectMetadata', 'fieldMetadata'] as const;

@RegisteredInstanceCommand('2.20.0', 1825000000000)
export class DropMetadataStandardOverridesColumnFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const table of TABLES) {
      await queryRunner.query(
        `ALTER TABLE "core"."${table}" DROP COLUMN IF EXISTS "standardOverrides"`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of TABLES) {
      await queryRunner.query(
        `ALTER TABLE "core"."${table}" ADD COLUMN IF NOT EXISTS "standardOverrides" jsonb`,
      );
      await queryRunner.query(
        `UPDATE "core"."${table}" SET "standardOverrides" = "overrides"`,
      );
    }
  }
}
```

## Test

```ts
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
            `UPDATE "core"."${table}" SET "standardOverrides" = "overrides"`,
          ]),
        );
      }
    });
  });
});
```
