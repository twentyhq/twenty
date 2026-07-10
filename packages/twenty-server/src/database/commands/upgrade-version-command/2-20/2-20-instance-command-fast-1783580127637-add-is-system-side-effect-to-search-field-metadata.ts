import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// searchFieldMetadata rows are always system-derived (never user-authored), so the
// new column defaults to true, which also backfills every existing row correctly.
@RegisteredInstanceCommand('2.20.0', 1783580127637)
export class AddIsSystemSideEffectToSearchFieldMetadataFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."searchFieldMetadata" ADD COLUMN IF NOT EXISTS "isSystemSideEffect" boolean NOT NULL DEFAULT true',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."searchFieldMetadata" DROP COLUMN IF EXISTS "isSystemSideEffect"',
    );
  }
}
