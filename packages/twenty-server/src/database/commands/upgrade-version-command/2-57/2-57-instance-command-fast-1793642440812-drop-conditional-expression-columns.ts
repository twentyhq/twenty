import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.57.0', 1793642440812)
export class DropConditionalExpressionColumnsFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."commandMenuItem" DROP COLUMN IF EXISTS "conditionalAvailabilityExpression"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."commandMenuItem" DROP COLUMN IF EXISTS "conditionalPinnedExpression"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."pageLayoutWidget" DROP COLUMN IF EXISTS "conditionalAvailabilityExpression"',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."pageLayoutWidget" ADD COLUMN IF NOT EXISTS "conditionalAvailabilityExpression" character varying',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."commandMenuItem" ADD COLUMN IF NOT EXISTS "conditionalPinnedExpression" character varying',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."commandMenuItem" ADD COLUMN IF NOT EXISTS "conditionalAvailabilityExpression" character varying',
    );
  }
}
