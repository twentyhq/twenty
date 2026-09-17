import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.42.0', 1789656830373)
export class AddFrontComponentSettingsTabFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."frontComponent" ADD "settingsTab" jsonb',
    );
    // The application used to point at its single settings component; a
    // non-null settingsTab is what marks one from now on, so carry the
    // existing pointer over before it stops being read.
    await queryRunner.query(
      `UPDATE "core"."frontComponent" SET "settingsTab" = '{}'::jsonb
       FROM "core"."application"
       WHERE "core"."application"."settingsCustomTabFrontComponentId" = "core"."frontComponent"."id"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."frontComponent" DROP COLUMN "settingsTab"',
    );
  }
}
