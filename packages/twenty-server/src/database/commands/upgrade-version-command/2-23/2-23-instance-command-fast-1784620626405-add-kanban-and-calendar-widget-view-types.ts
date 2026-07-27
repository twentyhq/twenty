import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.23.0', 1784620626405)
export class AddKanbanAndCalendarWidgetViewTypesFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "core"."view_type_enum" ADD VALUE IF NOT EXISTS 'KANBAN_WIDGET' AFTER 'TABLE_WIDGET'`,
    );
    await queryRunner.query(
      `ALTER TYPE "core"."view_type_enum" ADD VALUE IF NOT EXISTS 'CALENDAR_WIDGET' AFTER 'KANBAN_WIDGET'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      "CREATE TYPE \"core\".\"view_type_enum_old\" AS ENUM('TABLE', 'KANBAN', 'CALENDAR', 'FIELDS_WIDGET', 'TABLE_WIDGET')",
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
