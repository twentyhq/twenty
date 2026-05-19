import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// Backport of the relationTargetFieldMetadataId column-add to 2.5.0 so that
// the 2.5 workspace command NormalizeCompositeFieldDefaults — which selects
// this column via WorkspaceFlatViewFilterMapCacheService.computeForCache —
// can run on v2.3 and v2.4 baselines. The upgrade runner walks forward from
// `lastAttemptedCommandName`, so the 2.3 backport is skipped for users
// already past v2.3 and the 2.6 add runs too late.
@RegisteredInstanceCommand('2.5.0', 1798500001000)
export class AddRelationTargetFieldMetadataIdToViewFilterFastInstanceCommand2_5
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" ADD COLUMN IF NOT EXISTS "relationTargetFieldMetadataId" uuid`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" DROP COLUMN IF EXISTS "relationTargetFieldMetadataId"`,
    );
  }
}
