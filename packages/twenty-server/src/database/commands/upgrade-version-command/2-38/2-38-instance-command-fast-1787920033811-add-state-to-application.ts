import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.38.0', 1787920033811)
export class AddStateToApplicationFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Pre-existing rows are completed installations, so they are backfilled
    // as INSTALLED before the default switches to INSTALLING for new rows.
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD COLUMN IF NOT EXISTS "state" text NOT NULL DEFAULT 'INSTALLED'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ALTER COLUMN "state" SET DEFAULT 'INSTALLING'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."application" DROP COLUMN IF EXISTS "state"`,
    );
  }
}
