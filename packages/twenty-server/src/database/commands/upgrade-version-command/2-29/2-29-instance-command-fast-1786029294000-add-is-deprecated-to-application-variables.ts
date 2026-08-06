import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.29.0', 1786029294000)
export class AddIsDeprecatedToApplicationVariablesFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariable" ADD COLUMN IF NOT EXISTS "isDeprecated" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistrationVariable" ADD COLUMN IF NOT EXISTS "isDeprecated" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistrationVariable" DROP COLUMN IF EXISTS "isDeprecated"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariable" DROP COLUMN IF EXISTS "isDeprecated"`,
    );
  }
}
