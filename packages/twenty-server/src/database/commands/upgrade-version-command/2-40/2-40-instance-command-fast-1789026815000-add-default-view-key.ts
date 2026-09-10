import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.40.0', 1789026815000)
export class AddDefaultViewKeyFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "core"."view_key_enum" ADD VALUE IF NOT EXISTS 'DEFAULT' AFTER 'INDEX'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "core"."view" SET "key" = NULL WHERE "key" = 'DEFAULT'`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."view_key_enum_old" AS ENUM('INDEX')`,
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" ALTER COLUMN "key" DROP DEFAULT',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" ALTER COLUMN "key" TYPE "core"."view_key_enum_old" USING "key"::"text"::"core"."view_key_enum_old"',
    );
    await queryRunner.query('DROP TYPE "core"."view_key_enum"');
    await queryRunner.query(
      'ALTER TYPE "core"."view_key_enum_old" RENAME TO "view_key_enum"',
    );
  }
}
