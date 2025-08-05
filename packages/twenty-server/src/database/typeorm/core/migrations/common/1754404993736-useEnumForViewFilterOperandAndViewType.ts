import { MigrationInterface, QueryRunner } from 'typeorm';

export class UseEnumForViewFilterOperandAndViewType1754404993736
  implements MigrationInterface
{
  name = 'UseEnumForViewFilterOperandAndViewType1754404993736';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" DROP COLUMN "operand"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."viewFilter_operand_enum" AS ENUM('is', 'isNotNull', 'isNot', 'lessThan', 'greaterThan', 'isBefore', 'isAfter', 'contains', 'doesNotContain', 'isEmpty', 'isNotEmpty', 'isRelative', 'isInPast', 'isInFuture', 'isToday', 'search')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" ADD "operand" "core"."viewFilter_operand_enum" NOT NULL DEFAULT 'contains'`,
    );
    await queryRunner.query(`ALTER TABLE "core"."view" DROP COLUMN "type"`);
    await queryRunner.query(
      `CREATE TYPE "core"."view_type_enum" AS ENUM('TABLE', 'KANBAN')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD "type" "core"."view_type_enum" NOT NULL DEFAULT 'TABLE'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "core"."view" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "core"."view_type_enum"`);
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD "type" character varying NOT NULL DEFAULT 'table'`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" DROP COLUMN "operand"`,
    );
    await queryRunner.query(`DROP TYPE "core"."viewFilter_operand_enum"`);
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" ADD "operand" character varying NOT NULL DEFAULT 'Contains'`,
    );
  }
}
