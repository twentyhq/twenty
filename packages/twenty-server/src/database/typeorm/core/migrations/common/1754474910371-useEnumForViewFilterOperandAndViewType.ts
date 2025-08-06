import { MigrationInterface, QueryRunner } from 'typeorm';

export class UseEnumForViewFilterOperandAndViewType1754474910371
  implements MigrationInterface
{
  name = 'UseEnumForViewFilterOperandAndViewType1754474910371';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" DROP COLUMN "operand"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."viewFilter_operand_enum" AS ENUM('IS', 'IS_NOT_NULL', 'IS_NOT', 'LESS_THAN_OR_EQUAL', 'GREATER_THAN_OR_EQUAL', 'IS_BEFORE', 'IS_AFTER', 'CONTAINS', 'DOES_NOT_CONTAIN', 'IS_EMPTY', 'IS_NOT_EMPTY', 'IS_RELATIVE', 'IS_IN_PAST', 'IS_IN_FUTURE', 'IS_TODAY', 'VECTOR_SEARCH')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" ADD "operand" "core"."viewFilter_operand_enum" NOT NULL DEFAULT 'CONTAINS'`,
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
