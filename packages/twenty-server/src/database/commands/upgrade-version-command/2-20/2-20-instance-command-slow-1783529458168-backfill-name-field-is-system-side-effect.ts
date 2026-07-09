import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

// The default `name` field used to be provisioned with isSystemSideEffect: true
// (2.15 → 2.19). It is now a caller-provided default (isSystemSideEffect: false),
// like every other user-owned field, so existing rows must be re-flagged.
//
// Scoping by name alone is safe: no engine-owned field is named `name` (the
// reserved set is id/createdAt/updatedAt/deletedAt/createdBy/updatedBy/position/
// searchVector), and API-created custom fields are always false already.
//
// This is a pure data backfill, so the write lives in runDataMigration() (slow
// instance command) rather than up(): keeping the bulk UPDATE out of the fast
// schema transaction avoids holding an ACCESS EXCLUSIVE lock that could stall
// reads during the deploy. Slow instance commands still run before every
// workspace command of the version (order is fast → slow → workspace), so the
// fresh value is in place before the 2.20 search reconcile workspace commands
// flush and recompute the fieldMetadata flat-entity cache (the UPDATE itself
// does not invalidate the per-workspace cache).
@RegisteredInstanceCommand('2.20.0', 1783529458168, { type: 'slow' })
export class BackfillNameFieldIsSystemSideEffectSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      `UPDATE "core"."fieldMetadata" SET "isSystemSideEffect" = false WHERE "name" = 'name' AND "isSystemSideEffect" = true`,
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  // Best-effort inverse: restores the 2.15 → 2.19 status quo where `name` fields
  // were flagged true. Over-approximates on rollback because pre-2.15 `name` rows
  // were legitimately false and are indistinguishable from the ones flipped above.
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "core"."fieldMetadata" SET "isSystemSideEffect" = true WHERE "name" = 'name' AND "isSystemSideEffect" = false`,
    );
  }
}
