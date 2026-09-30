import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.44.0', 1790757005262)
export class AddScopeToApplicationVariablesFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."applicationVariable_scope_enum" AS ENUM('WORKSPACE', 'USER')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariable" ADD "scope" "core"."applicationVariable_scope_enum" NOT NULL DEFAULT 'WORKSPACE'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariable" ALTER COLUMN "value" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariable" ADD CONSTRAINT "CHK_applicationVariable_value_null_only_for_user_scope" CHECK (("scope" = 'USER') = ("value" IS NULL))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariable" DROP CONSTRAINT "CHK_applicationVariable_value_null_only_for_user_scope"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariable" ALTER COLUMN "value" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariable" DROP COLUMN "scope"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."applicationVariable_scope_enum"`,
    );
  }
}
