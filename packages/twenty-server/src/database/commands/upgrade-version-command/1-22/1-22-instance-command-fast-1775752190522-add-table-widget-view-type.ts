import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('1.22.0', 1775752190522)
export class AddTableWidgetViewTypeFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "core"."view_type_enum" ADD VALUE IF NOT EXISTS 'TABLE_WIDGET' AFTER 'FIELDS_WIDGET'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "CREATE TYPE \"core\".\"view_type_enum_old\" AS ENUM('TABLE', 'KANBAN', 'CALENDAR', 'FIELDS_WIDGET')",
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" ALTER COLUMN "type" DROP DEFAULT',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" ALTER COLUMN "type" TYPE "core"."view_type_enum_old" USING "type"::"text"::"core"."view_type_enum_old"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."view" ALTER COLUMN "type" SET DEFAULT \'TABLE\'',
    );
    await queryRunner.query('DROP TYPE "core"."view_type_enum"');
    await queryRunner.query(
      'ALTER TYPE "core"."view_type_enum_old" RENAME TO "view_type_enum"',
    );
  }
}
