import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// The engine-owned FIELDS_WIDGET record-page view is keyed on the reserved
// ViewKey.FIELDS_WIDGET; the 2-28 record-page reconcile backfills the key on
// existing rows.
@RegisteredInstanceCommand('2.28.0', 1786010743000)
export class AddFieldsWidgetViewKeyFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "core"."view_key_enum" ADD VALUE IF NOT EXISTS 'FIELDS_WIDGET'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'CREATE TYPE "core"."view_key_enum_old" AS ENUM(\'INDEX\')',
    );
    await queryRunner.query(
      'UPDATE "core"."view" SET "key" = NULL WHERE "key" = \'FIELDS_WIDGET\'',
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
