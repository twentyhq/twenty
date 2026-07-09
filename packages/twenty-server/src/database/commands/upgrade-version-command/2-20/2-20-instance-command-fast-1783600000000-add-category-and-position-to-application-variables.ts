import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.20.0', 1783600000000)
export class AddCategoryAndPositionToApplicationVariablesFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariable" ADD COLUMN IF NOT EXISTS "category" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariable" ADD COLUMN IF NOT EXISTS "position" double precision`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistrationVariable" ADD COLUMN IF NOT EXISTS "category" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistrationVariable" ADD COLUMN IF NOT EXISTS "position" double precision`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistrationVariable" DROP COLUMN IF EXISTS "position"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistrationVariable" DROP COLUMN IF EXISTS "category"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariable" DROP COLUMN IF EXISTS "position"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariable" DROP COLUMN IF EXISTS "category"`,
    );
  }
}
