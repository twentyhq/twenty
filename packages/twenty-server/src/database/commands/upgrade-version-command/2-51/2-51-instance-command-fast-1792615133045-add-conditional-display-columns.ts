import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.51.0', 1792615133045)
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
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
