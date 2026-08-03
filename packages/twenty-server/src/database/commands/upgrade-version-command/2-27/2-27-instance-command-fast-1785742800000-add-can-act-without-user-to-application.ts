import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.27.0', 1785742800000)
export class AddCanActWithoutUserToApplicationFastInstanceCommand
  implements FastInstanceCommand
{
  // Defaults to true so existing rows keep the capability they already had,
  // then flips so new rows have to ask for it. A backfill UPDATE would do the
  // same but holds an ACCESS EXCLUSIVE lock for the length of the table.
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."application" ADD "canActWithoutUser" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."application" ALTER COLUMN "canActWithoutUser" SET DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."application" DROP COLUMN "canActWithoutUser"',
    );
  }
}
