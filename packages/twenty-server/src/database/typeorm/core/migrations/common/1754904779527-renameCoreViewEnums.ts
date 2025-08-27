import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class RenameCoreViewEnums1754904779527 implements MigrationInterface {
  name = 'RenameCoreViewEnums1754904779527';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "core"."AggregateOperations" RENAME TO "AggregateOperations_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."viewField_aggregateoperation_enum" AS ENUM('MIN', 'MAX', 'AVG', 'SUM', 'COUNT', 'COUNT_UNIQUE_VALUES', 'COUNT_EMPTY', 'COUNT_NOT_EMPTY', 'COUNT_TRUE', 'COUNT_FALSE', 'PERCENTAGE_EMPTY', 'PERCENTAGE_NOT_EMPTY')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" ALTER COLUMN "aggregateOperation" TYPE "core"."viewField_aggregateoperation_enum" USING "aggregateOperation"::"text"::"core"."viewField_aggregateoperation_enum"`,
    );
    await queryRunner.query(`DROP TYPE "core"."AggregateOperations_old"`);
    await queryRunner.query(
      `ALTER TYPE "core"."ViewFilterOperand" RENAME TO "ViewFilterOperand_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."viewFilter_operand_enum" AS ENUM('IS', 'IS_NOT_NULL', 'IS_NOT', 'LESS_THAN_OR_EQUAL', 'GREATER_THAN_OR_EQUAL', 'IS_BEFORE', 'IS_AFTER', 'CONTAINS', 'DOES_NOT_CONTAIN', 'IS_EMPTY', 'IS_NOT_EMPTY', 'IS_RELATIVE', 'IS_IN_PAST', 'IS_IN_FUTURE', 'IS_TODAY', 'VECTOR_SEARCH')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" ALTER COLUMN "operand" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" ALTER COLUMN "operand" TYPE "core"."viewFilter_operand_enum" USING "operand"::"text"::"core"."viewFilter_operand_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" ALTER COLUMN "operand" SET DEFAULT 'CONTAINS'`,
    );
    await queryRunner.query(`DROP TYPE "core"."ViewFilterOperand_old"`);
    await queryRunner.query(
      `ALTER TYPE "core"."ViewFilterGroupLogicalOperator" RENAME TO "ViewFilterGroupLogicalOperator_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."viewFilterGroup_logicaloperator_enum" AS ENUM('AND', 'OR', 'NOT')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" ALTER COLUMN "logicalOperator" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" ALTER COLUMN "logicalOperator" TYPE "core"."viewFilterGroup_logicaloperator_enum" USING "logicalOperator"::"text"::"core"."viewFilterGroup_logicaloperator_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" ALTER COLUMN "logicalOperator" SET DEFAULT 'AND'`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."ViewFilterGroupLogicalOperator_old"`,
    );
    await queryRunner.query(
      `ALTER TYPE "core"."ViewSortDirection" RENAME TO "ViewSortDirection_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."viewSort_direction_enum" AS ENUM('ASC', 'DESC')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" ALTER COLUMN "direction" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" ALTER COLUMN "direction" TYPE "core"."viewSort_direction_enum" USING "direction"::"text"::"core"."viewSort_direction_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" ALTER COLUMN "direction" SET DEFAULT 'ASC'`,
    );
    await queryRunner.query(`DROP TYPE "core"."ViewSortDirection_old"`);
    await queryRunner.query(
      `ALTER TYPE "core"."ViewType" RENAME TO "ViewType_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."view_type_enum" AS ENUM('TABLE', 'KANBAN')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "type" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "type" TYPE "core"."view_type_enum" USING "type"::"text"::"core"."view_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "type" SET DEFAULT 'TABLE'`,
    );
    await queryRunner.query(`DROP TYPE "core"."ViewType_old"`);
    await queryRunner.query(
      `ALTER TYPE "core"."ViewOpenRecordIn" RENAME TO "ViewOpenRecordIn_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."view_openrecordin_enum" AS ENUM('SIDE_PANEL', 'RECORD_PAGE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "openRecordIn" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "openRecordIn" TYPE "core"."view_openrecordin_enum" USING "openRecordIn"::"text"::"core"."view_openrecordin_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "openRecordIn" SET DEFAULT 'SIDE_PANEL'`,
    );
    await queryRunner.query(`DROP TYPE "core"."ViewOpenRecordIn_old"`);
    await queryRunner.query(
      `ALTER TYPE "core"."KanbanAggregateOperations" RENAME TO "KanbanAggregateOperations_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."view_kanbanaggregateoperation_enum" AS ENUM('MIN', 'MAX', 'AVG', 'SUM', 'COUNT', 'COUNT_UNIQUE_VALUES', 'COUNT_EMPTY', 'COUNT_NOT_EMPTY', 'COUNT_TRUE', 'COUNT_FALSE', 'PERCENTAGE_EMPTY', 'PERCENTAGE_NOT_EMPTY')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "kanbanAggregateOperation" TYPE "core"."view_kanbanaggregateoperation_enum" USING "kanbanAggregateOperation"::"text"::"core"."view_kanbanaggregateoperation_enum"`,
    );
    await queryRunner.query(`DROP TYPE "core"."KanbanAggregateOperations_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "core"."KanbanAggregateOperations_old" AS ENUM('AVG', 'COUNT', 'COUNT_EMPTY', 'COUNT_FALSE', 'COUNT_NOT_EMPTY', 'COUNT_TRUE', 'COUNT_UNIQUE_VALUES', 'MAX', 'MIN', 'PERCENTAGE_EMPTY', 'PERCENTAGE_NOT_EMPTY', 'SUM')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "kanbanAggregateOperation" TYPE "core"."KanbanAggregateOperations_old" USING "kanbanAggregateOperation"::"text"::"core"."KanbanAggregateOperations_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."view_kanbanaggregateoperation_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "core"."KanbanAggregateOperations_old" RENAME TO "KanbanAggregateOperations"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."ViewOpenRecordIn_old" AS ENUM('RECORD_PAGE', 'SIDE_PANEL')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "openRecordIn" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "openRecordIn" TYPE "core"."ViewOpenRecordIn_old" USING "openRecordIn"::"text"::"core"."ViewOpenRecordIn_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "openRecordIn" SET DEFAULT 'SIDE_PANEL'`,
    );
    await queryRunner.query(`DROP TYPE "core"."view_openrecordin_enum"`);
    await queryRunner.query(
      `ALTER TYPE "core"."ViewOpenRecordIn_old" RENAME TO "ViewOpenRecordIn"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."ViewType_old" AS ENUM('KANBAN', 'TABLE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "type" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "type" TYPE "core"."ViewType_old" USING "type"::"text"::"core"."ViewType_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "type" SET DEFAULT 'TABLE'`,
    );
    await queryRunner.query(`DROP TYPE "core"."view_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "core"."ViewType_old" RENAME TO "ViewType"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."ViewSortDirection_old" AS ENUM('ASC', 'DESC')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" ALTER COLUMN "direction" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" ALTER COLUMN "direction" TYPE "core"."ViewSortDirection_old" USING "direction"::"text"::"core"."ViewSortDirection_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" ALTER COLUMN "direction" SET DEFAULT 'ASC'`,
    );
    await queryRunner.query(`DROP TYPE "core"."viewSort_direction_enum"`);
    await queryRunner.query(
      `ALTER TYPE "core"."ViewSortDirection_old" RENAME TO "ViewSortDirection"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."ViewFilterGroupLogicalOperator_old" AS ENUM('AND', 'NOT', 'OR')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" ALTER COLUMN "logicalOperator" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" ALTER COLUMN "logicalOperator" TYPE "core"."ViewFilterGroupLogicalOperator_old" USING "logicalOperator"::"text"::"core"."ViewFilterGroupLogicalOperator_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" ALTER COLUMN "logicalOperator" SET DEFAULT 'NOT'`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."viewFilterGroup_logicaloperator_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "core"."ViewFilterGroupLogicalOperator_old" RENAME TO "ViewFilterGroupLogicalOperator"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."ViewFilterOperand_old" AS ENUM('CONTAINS', 'DOES_NOT_CONTAIN', 'GREATER_THAN_OR_EQUAL', 'IS', 'IS_AFTER', 'IS_BEFORE', 'IS_EMPTY', 'IS_IN_FUTURE', 'IS_IN_PAST', 'IS_NOT', 'IS_NOT_EMPTY', 'IS_NOT_NULL', 'IS_RELATIVE', 'IS_TODAY', 'LESS_THAN_OR_EQUAL', 'VECTOR_SEARCH')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" ALTER COLUMN "operand" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" ALTER COLUMN "operand" TYPE "core"."ViewFilterOperand_old" USING "operand"::"text"::"core"."ViewFilterOperand_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" ALTER COLUMN "operand" SET DEFAULT 'CONTAINS'`,
    );
    await queryRunner.query(`DROP TYPE "core"."viewFilter_operand_enum"`);
    await queryRunner.query(
      `ALTER TYPE "core"."ViewFilterOperand_old" RENAME TO "ViewFilterOperand"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."AggregateOperations_old" AS ENUM('AVG', 'COUNT', 'COUNT_EMPTY', 'COUNT_FALSE', 'COUNT_NOT_EMPTY', 'COUNT_TRUE', 'COUNT_UNIQUE_VALUES', 'MAX', 'MIN', 'PERCENTAGE_EMPTY', 'PERCENTAGE_NOT_EMPTY', 'SUM')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" ALTER COLUMN "aggregateOperation" TYPE "core"."AggregateOperations_old" USING "aggregateOperation"::"text"::"core"."AggregateOperations_old"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."viewField_aggregateoperation_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "core"."AggregateOperations_old" RENAME TO "AggregateOperations"`,
    );
  }
}
