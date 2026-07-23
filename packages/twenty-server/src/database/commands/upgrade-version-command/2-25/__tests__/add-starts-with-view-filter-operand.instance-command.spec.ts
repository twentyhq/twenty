import { type QueryRunner } from 'typeorm';

import { AddStartsWithViewFilterOperandFastInstanceCommand } from 'src/database/commands/upgrade-version-command/2-25/2-25-instance-command-fast-1784842288025-add-starts-with-view-filter-operand';

describe('AddStartsWithViewFilterOperandFastInstanceCommand', () => {
  let command: AddStartsWithViewFilterOperandFastInstanceCommand;

  beforeEach(() => {
    command = new AddStartsWithViewFilterOperandFastInstanceCommand();
  });

  it('adds STARTS_WITH to the view filter operand enum', async () => {
    const query = jest.fn().mockResolvedValue(undefined);
    const queryRunner = { query } as unknown as QueryRunner;

    await command.up(queryRunner);

    expect(query).toHaveBeenCalledWith(
      `ALTER TYPE "core"."viewFilter_operand_enum" ADD VALUE IF NOT EXISTS 'STARTS_WITH'`,
    );
  });

  it('remaps STARTS_WITH filters and recreates the enum on rollback', async () => {
    const query = jest.fn().mockResolvedValue(undefined);
    const queryRunner = { query } as unknown as QueryRunner;

    await command.down(queryRunner);

    const statements = query.mock.calls.map((call) => call[0] as string);

    expect(statements).toEqual([
      `UPDATE "core"."viewFilter" SET "operand" = 'CONTAINS' WHERE "operand" = 'STARTS_WITH'`,
      `ALTER TABLE "core"."viewFilter" ALTER COLUMN "operand" DROP DEFAULT`,
      `CREATE TYPE "core"."viewFilter_operand_enum_old" AS ENUM('IS', 'IS_NOT_NULL', 'IS_NOT', 'LESS_THAN_OR_EQUAL', 'GREATER_THAN_OR_EQUAL', 'IS_BEFORE', 'IS_AFTER', 'CONTAINS', 'DOES_NOT_CONTAIN', 'IS_EMPTY', 'IS_NOT_EMPTY', 'IS_RELATIVE', 'IS_IN_PAST', 'IS_IN_FUTURE', 'IS_TODAY', 'VECTOR_SEARCH')`,
      `ALTER TABLE "core"."viewFilter" ALTER COLUMN "operand" TYPE "core"."viewFilter_operand_enum_old" USING "operand"::"text"::"core"."viewFilter_operand_enum_old"`,
      `ALTER TABLE "core"."viewFilter" ALTER COLUMN "operand" SET DEFAULT 'CONTAINS'`,
      `DROP TYPE "core"."viewFilter_operand_enum"`,
      `ALTER TYPE "core"."viewFilter_operand_enum_old" RENAME TO "viewFilter_operand_enum"`,
    ]);
  });
});
