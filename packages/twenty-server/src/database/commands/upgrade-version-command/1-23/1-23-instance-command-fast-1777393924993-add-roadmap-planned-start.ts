import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// Adds the optional `roadmapFieldPlannedStartId` column to `core.view` so
// the Roadmap view can render a planned start (paired with planned end)
// for the dashed ghost-bar showing the original plan range.
@RegisteredInstanceCommand('1.23.0', 1777393924993)
export class AddRoadmapPlannedStartFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."view" ADD COLUMN IF NOT EXISTS "roadmapFieldPlannedStartId" uuid',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" ADD CONSTRAINT "FK_beff39ca2d14078baca4344e44d" FOREIGN KEY ("roadmapFieldPlannedStartId") REFERENCES "core"."fieldMetadata"("id") ON DELETE SET NULL ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."view" DROP CONSTRAINT IF EXISTS "FK_beff39ca2d14078baca4344e44d"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" DROP COLUMN IF EXISTS "roadmapFieldPlannedStartId"',
    );
  }
}
