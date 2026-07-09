import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// The default `name` field used to be provisioned with isSystemSideEffect: true
// (2.15 → 2.19). It is now a caller-provided default (isSystemSideEffect: false),
// like every other user-owned field, so existing rows must be re-flagged.
//
// Scoping by name alone is safe: no engine-owned field is named `name` (the
// reserved set is id/createdAt/updatedAt/deletedAt/createdBy/updatedBy/position/
// searchVector), and API-created custom fields are always false already.
//
// Registered at 1783529458168 so it runs immediately before the 2.20 search
// reconcile workspace commands (…169/170/171): those flush and recompute the
// fieldMetadata flat-entity cache, so scheduling the raw UPDATE ahead of them
// lets the fresh value be picked up (the UPDATE itself does not invalidate the
// per-workspace cache).
@RegisteredInstanceCommand('2.20.0', 1783529458168)
export class BackfillNameFieldIsSystemSideEffectFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "core"."fieldMetadata" SET "isSystemSideEffect" = false WHERE "name" = 'name' AND "isSystemSideEffect" = true`,
    );
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
