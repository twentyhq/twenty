import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.56.0', 1793642440810)
export class AddConditionalDisplayColumnsFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."pageLayoutTab" ADD COLUMN IF NOT EXISTS "conditionalDisplay" jsonb',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."viewField" ADD COLUMN IF NOT EXISTS "conditionalDisplay" jsonb',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" ADD COLUMN IF NOT EXISTS "conditionalDisplay" jsonb',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."commandMenuItem" ADD COLUMN IF NOT EXISTS "conditionalDisplay" jsonb',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."commandMenuItem" ADD COLUMN IF NOT EXISTS "conditionalAvailability" jsonb',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."commandMenuItem" ADD COLUMN IF NOT EXISTS "conditionalPinned" jsonb',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."pageLayoutWidget" ADD COLUMN IF NOT EXISTS "conditionalAvailability" jsonb',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."pageLayoutWidget" DROP COLUMN IF EXISTS "conditionalAvailability"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."commandMenuItem" DROP COLUMN IF EXISTS "conditionalPinned"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."commandMenuItem" DROP COLUMN IF EXISTS "conditionalAvailability"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."commandMenuItem" DROP COLUMN IF EXISTS "conditionalDisplay"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" DROP COLUMN IF EXISTS "conditionalDisplay"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."viewField" DROP COLUMN IF EXISTS "conditionalDisplay"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."pageLayoutTab" DROP COLUMN IF EXISTS "conditionalDisplay"',
    );
  }
}
