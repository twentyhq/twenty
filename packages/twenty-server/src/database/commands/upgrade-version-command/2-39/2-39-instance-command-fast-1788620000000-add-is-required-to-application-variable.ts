import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.39.0', 1788620000000)
export class AddIsRequiredToApplicationVariableFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariable" ADD COLUMN IF NOT EXISTS "isRequired" boolean NOT NULL DEFAULT false`,
    );
    // Same rule the registration variables already enforce: a deprecated variable is excluded
    // from the configuration check, so requiring it would be a contradiction the UI cannot show.
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariable" DROP CONSTRAINT IF EXISTS "CHK_applicationVariable_deprecated_not_required"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariable" ADD CONSTRAINT "CHK_applicationVariable_deprecated_not_required" CHECK (NOT ("isRequired" AND "isDeprecated"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariable" DROP CONSTRAINT IF EXISTS "CHK_applicationVariable_deprecated_not_required"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."applicationVariable" DROP COLUMN IF EXISTS "isRequired"`,
    );
  }
}
