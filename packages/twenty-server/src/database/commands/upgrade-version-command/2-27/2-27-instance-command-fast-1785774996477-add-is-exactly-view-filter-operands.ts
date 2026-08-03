import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.27.0', 1785774996477)
export class AddIsExactlyViewFilterOperandsFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "core"."viewFilter_operand_enum" ADD VALUE IF NOT EXISTS 'IS_EXACTLY' AFTER 'DOES_NOT_CONTAIN'`,
    );
    await queryRunner.query(
      `ALTER TYPE "core"."viewFilter_operand_enum" ADD VALUE IF NOT EXISTS 'IS_NOT_EXACTLY' AFTER 'IS_EXACTLY'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "core"."viewFilter" SET "operand" = 'CONTAINS' WHERE "operand" = 'IS_EXACTLY'`,
    );
    await queryRunner.query(
      `UPDATE "core"."viewFilter" SET "operand" = 'DOES_NOT_CONTAIN' WHERE "operand" = 'IS_NOT_EXACTLY'`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."viewFilter_operand_enum_old" AS ENUM('IS', 'IS_NOT_NULL', 'IS_NOT', 'LESS_THAN_OR_EQUAL', 'GREATER_THAN_OR_EQUAL', 'IS_BEFORE', 'IS_AFTER', 'CONTAINS', 'DOES_NOT_CONTAIN', 'IS_EMPTY', 'IS_NOT_EMPTY', 'IS_RELATIVE', 'IS_IN_PAST', 'IS_IN_FUTURE', 'IS_TODAY', 'VECTOR_SEARCH')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" ALTER COLUMN "operand" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" ALTER COLUMN "operand" TYPE "core"."viewFilter_operand_enum_old" USING "operand"::"text"::"core"."viewFilter_operand_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" ALTER COLUMN "operand" SET DEFAULT 'CONTAINS'`,
    );
    await queryRunner.query(`DROP TYPE "core"."viewFilter_operand_enum"`);
    await queryRunner.query(
      `ALTER TYPE "core"."viewFilter_operand_enum_old" RENAME TO "viewFilter_operand_enum"`,
    );
  }
}
