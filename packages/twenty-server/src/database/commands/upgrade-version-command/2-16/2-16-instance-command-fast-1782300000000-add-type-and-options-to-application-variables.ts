import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.16.0', 1782300000000)
export class AddTypeAndOptionsToApplicationVariablesFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariable" ADD COLUMN IF NOT EXISTS "type" text NOT NULL DEFAULT 'TEXT'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariable" ADD COLUMN IF NOT EXISTS "options" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistrationVariable" ADD COLUMN IF NOT EXISTS "type" text NOT NULL DEFAULT 'TEXT'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistrationVariable" ADD COLUMN IF NOT EXISTS "options" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistrationVariable" DROP COLUMN IF EXISTS "options"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationRegistrationVariable" DROP COLUMN IF EXISTS "type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariable" DROP COLUMN IF EXISTS "options"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariable" DROP COLUMN IF EXISTS "type"`,
    );
  }
}
