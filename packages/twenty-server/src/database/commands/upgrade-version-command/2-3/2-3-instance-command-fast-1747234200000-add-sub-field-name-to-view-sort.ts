import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// The `subFieldName` column is officially introduced in 2.5
// (see `2-5-instance-command-fast-1778502963794-add-sub-field-name-to-view-sort.ts`),
// but cross-version upgrades from pre-2.3 fail before they ever reach a 2.5
// instance command: the 2.3 `DropMessageDirectionFieldCommand` builds a
// migration that deletes a `fieldMetadata`, and the workspace-migration runner
// pulls in `flatViewSortMaps` via the metadata cascade graph (`viewSort` →
// `fieldMetadata` is a many-to-one, so `viewSort` is in `fieldMetadata`'s
// inverse one-to-many set). That recomputes
// `WorkspaceFlatViewSortMapCacheService`, which does a `viewSortRepository.find()`
// — TypeORM emits a SELECT that includes `subFieldName`, the column doesn't
// exist in DB yet, and the upgrade aborts.
//
// Adding the column here ensures it exists before any 2.3 workspace command
// can trigger that cascade. The 2.5 instance command is idempotent (uses
// `IF NOT EXISTS`), so cross-upgrade callers see it as a no-op while
// fresh-from-2.5 install paths still create the column there as before.
@RegisteredInstanceCommand('2.3.0', 1747234200000)
export class AddSubFieldNameToViewSortEarlyFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" ADD COLUMN IF NOT EXISTS "subFieldName" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" DROP COLUMN IF EXISTS "subFieldName"`,
    );
  }
}
