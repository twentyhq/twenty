import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// Fase 6 — adds the 4 optional columns to `core.view` that drive the
// planned-vs-actual ghost bar, the overdue/deviation indicators, and
// the cumulative slip badge. The OpportunityMilestone workspace entity
// itself is created per-workspace by the metadata sync run that follows
// this migration; only the core.view extension lives in this command.
@RegisteredInstanceCommand('1.23.0', 1777388184036)
export class AddOpportunityMilestoneAndRoadmapExtensionsFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."view" ADD COLUMN IF NOT EXISTS "roadmapFieldPlannedEndId" uuid',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" ADD COLUMN IF NOT EXISTS "roadmapFieldStatusId" uuid',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" ADD COLUMN IF NOT EXISTS "roadmapFieldBlockedById" uuid',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" ADD COLUMN IF NOT EXISTS "roadmapShowDeviation" boolean NOT NULL DEFAULT false',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" ADD CONSTRAINT "FK_71c63d7c2763b05a8d185afc5db" FOREIGN KEY ("roadmapFieldPlannedEndId") REFERENCES "core"."fieldMetadata"("id") ON DELETE SET NULL ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" ADD CONSTRAINT "FK_ed798d330539053631e4e446e68" FOREIGN KEY ("roadmapFieldStatusId") REFERENCES "core"."fieldMetadata"("id") ON DELETE SET NULL ON UPDATE NO ACTION',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" ADD CONSTRAINT "FK_e31ef3d304e09d7bae63d6e1290" FOREIGN KEY ("roadmapFieldBlockedById") REFERENCES "core"."fieldMetadata"("id") ON DELETE SET NULL ON UPDATE NO ACTION',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."view" DROP CONSTRAINT IF EXISTS "FK_e31ef3d304e09d7bae63d6e1290"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" DROP CONSTRAINT IF EXISTS "FK_ed798d330539053631e4e446e68"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" DROP CONSTRAINT IF EXISTS "FK_71c63d7c2763b05a8d185afc5db"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" DROP COLUMN IF EXISTS "roadmapShowDeviation"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" DROP COLUMN IF EXISTS "roadmapFieldBlockedById"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" DROP COLUMN IF EXISTS "roadmapFieldStatusId"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" DROP COLUMN IF EXISTS "roadmapFieldPlannedEndId"',
    );
  }
}
