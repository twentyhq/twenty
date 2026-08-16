// SOURCING: twentyhq/twenty AddListViewTypeFastInstanceCommand — fork-local RELATIONS enum value
import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.31.0', 1786904400000)
export class AddRelationsViewTypeFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "core"."view_type_enum" ADD VALUE IF NOT EXISTS 'RELATIONS' AFTER 'LIST'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "core"."view" SET "type" = 'TABLE' WHERE "type" = 'RELATIONS'`,
    );
    await queryRunner.query(
      "CREATE TYPE \"core\".\"view_type_enum_old\" AS ENUM('TABLE', 'KANBAN', 'CALENDAR', 'LIST', 'FIELDS_WIDGET', 'TABLE_WIDGET', 'KANBAN_WIDGET', 'LIST_WIDGET', 'CALENDAR_WIDGET')",
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
