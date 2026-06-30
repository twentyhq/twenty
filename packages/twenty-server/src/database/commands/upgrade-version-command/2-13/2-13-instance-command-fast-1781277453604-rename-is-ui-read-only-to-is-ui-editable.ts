// Grandfathered: this 2.13 command already shipped to cloud and is recorded
// complete there, so per "never rewrite a committed instance command" it is
// frozen as-is. Its up() does ADD COLUMN + bulk UPDATE in one transaction — the
// exact pattern that held an ACCESS EXCLUSIVE lock and stalled prod reads, and
// the reason no-data-mutation-in-fast-instance-command exists. This is an
// exception, not a precedent: new backfills go in a slow instance command.
/* oxlint-disable twenty/no-data-mutation-in-fast-instance-command */
import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// Adds the positive isUIEditable flag (inverted polarity of the legacy
// isUIReadOnly flag) on both objectMetadata and fieldMetadata, and adds the
// object-level isUICreatable flag.
//
// The legacy isUIReadOnly column is intentionally NOT dropped here. The
// migration runs in an ArgoCD PreSync hook before the new pods roll out, so the
// previous release's pods keep serving while the schema changes — and they
// still SELECT isUIReadOnly on every fieldMetadata read. Dropping it in the
// same release that stops using it makes those pods throw "column isUIReadOnly
// does not exist" until the rollout completes. isUIReadOnly stays a plain
// column on both entities (no longer @WasRemovedInUpgrade, so it isn't
// dropped); its removal — decorator + physical drop — is deferred to a later
// release once no running code references it (core-team-issues#2542).
@RegisteredInstanceCommand('2.13.0', 1781277453604)
export class RenameIsUiReadOnlyToIsUiEditableFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."objectMetadata" ADD COLUMN IF NOT EXISTS "isUIEditable" boolean NOT NULL DEFAULT true',
    );
    await queryRunner.query(
      `UPDATE "core"."objectMetadata" SET "isUIEditable" = false WHERE "isUIReadOnly" = true`,
    );

    await queryRunner.query(
      'ALTER TABLE "core"."objectMetadata" ADD COLUMN IF NOT EXISTS "isUICreatable" boolean NOT NULL DEFAULT true',
    );

    await queryRunner.query(
      'ALTER TABLE "core"."fieldMetadata" ADD COLUMN IF NOT EXISTS "isUIEditable" boolean NOT NULL DEFAULT true',
    );
    await queryRunner.query(
      `UPDATE "core"."fieldMetadata" SET "isUIEditable" = false WHERE "isUIReadOnly" = true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."fieldMetadata" DROP COLUMN IF EXISTS "isUIEditable"',
    );

    await queryRunner.query(
      'ALTER TABLE "core"."objectMetadata" DROP COLUMN IF EXISTS "isUICreatable"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."objectMetadata" DROP COLUMN IF EXISTS "isUIEditable"',
    );
  }
}
