import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class UpdateCoreViewDataModel1754578392938
  implements MigrationInterface
{
  name = 'UpdateCoreViewDataModel1754578392938';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "core"."viewField_aggregateoperation_enum" RENAME TO "viewField_aggregateoperation_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."AggregateOperations" AS ENUM('MIN', 'MAX', 'AVG', 'SUM', 'COUNT', 'COUNT_UNIQUE_VALUES', 'COUNT_EMPTY', 'COUNT_NOT_EMPTY', 'COUNT_TRUE', 'COUNT_FALSE', 'PERCENTAGE_EMPTY', 'PERCENTAGE_NOT_EMPTY')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" ALTER COLUMN "aggregateOperation" TYPE "core"."AggregateOperations" USING "aggregateOperation"::"text"::"core"."AggregateOperations"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."viewField_aggregateoperation_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" DROP COLUMN "operand"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."ViewFilterOperand" AS ENUM('IS', 'IS_NOT_NULL', 'IS_NOT', 'LESS_THAN_OR_EQUAL', 'GREATER_THAN_OR_EQUAL', 'IS_BEFORE', 'IS_AFTER', 'CONTAINS', 'DOES_NOT_CONTAIN', 'IS_EMPTY', 'IS_NOT_EMPTY', 'IS_RELATIVE', 'IS_IN_PAST', 'IS_IN_FUTURE', 'IS_TODAY', 'VECTOR_SEARCH')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" ADD "operand" "core"."ViewFilterOperand" NOT NULL DEFAULT 'CONTAINS'`,
    );
    await queryRunner.query(
      `ALTER TYPE "core"."viewFilterGroup_logicaloperator_enum" RENAME TO "viewFilterGroup_logicaloperator_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."ViewFilterGroupLogicalOperator" AS ENUM('AND', 'OR', 'NOT')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" ALTER COLUMN "logicalOperator" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" ALTER COLUMN "logicalOperator" TYPE "core"."ViewFilterGroupLogicalOperator" USING "logicalOperator"::"text"::"core"."ViewFilterGroupLogicalOperator"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" ALTER COLUMN "logicalOperator" SET DEFAULT 'NOT'`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."viewFilterGroup_logicaloperator_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TYPE "core"."viewSort_direction_enum" RENAME TO "viewSort_direction_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."ViewSortDirection" AS ENUM('ASC', 'DESC')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" ALTER COLUMN "direction" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" ALTER COLUMN "direction" TYPE "core"."ViewSortDirection" USING "direction"::"text"::"core"."ViewSortDirection"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" ALTER COLUMN "direction" SET DEFAULT 'ASC'`,
    );
    await queryRunner.query(`DROP TYPE "core"."viewSort_direction_enum_old"`);
    await queryRunner.query(`ALTER TABLE "core"."view" DROP COLUMN "type"`);
    await queryRunner.query(
      `CREATE TYPE "core"."ViewType" AS ENUM('TABLE', 'KANBAN')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD "type" "core"."ViewType" NOT NULL DEFAULT 'TABLE'`,
    );
    await queryRunner.query(
      `ALTER TYPE "core"."view_openrecordin_enum" RENAME TO "view_openrecordin_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."ViewOpenRecordIn" AS ENUM('SIDE_PANEL', 'RECORD_PAGE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "openRecordIn" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "openRecordIn" TYPE "core"."ViewOpenRecordIn" USING "openRecordIn"::"text"::"core"."ViewOpenRecordIn"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "openRecordIn" SET DEFAULT 'SIDE_PANEL'`,
    );
    await queryRunner.query(`DROP TYPE "core"."view_openrecordin_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "core"."view_kanbanaggregateoperation_enum" RENAME TO "view_kanbanaggregateoperation_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."KanbanAggregateOperations" AS ENUM('MIN', 'MAX', 'AVG', 'SUM', 'COUNT', 'COUNT_UNIQUE_VALUES', 'COUNT_EMPTY', 'COUNT_NOT_EMPTY', 'COUNT_TRUE', 'COUNT_FALSE', 'PERCENTAGE_EMPTY', 'PERCENTAGE_NOT_EMPTY')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "kanbanAggregateOperation" TYPE "core"."KanbanAggregateOperations" USING "kanbanAggregateOperation"::"text"::"core"."KanbanAggregateOperations"`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."view_kanbanaggregateoperation_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" ADD CONSTRAINT "FK_b518bd61175e0963370e09ef15e" FOREIGN KEY ("viewFilterGroupId") REFERENCES "core"."viewFilterGroup"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" ADD CONSTRAINT "FK_6aa17342705ae5526de377bf7ed" FOREIGN KEY ("parentViewFilterGroupId") REFERENCES "core"."viewFilterGroup"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" DROP CONSTRAINT "FK_6aa17342705ae5526de377bf7ed"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" DROP CONSTRAINT "FK_b518bd61175e0963370e09ef15e"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."view_kanbanaggregateoperation_enum_old" AS ENUM('MIN', 'MAX', 'AVG', 'SUM', 'COUNT', 'COUNT_UNIQUE_VALUES', 'COUNT_EMPTY', 'COUNT_NOT_EMPTY', 'COUNT_TRUE', 'COUNT_FALSE', 'PERCENTAGE_EMPTY', 'PERCENTAGE_NOT_EMPTY')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "kanbanAggregateOperation" TYPE "core"."view_kanbanaggregateoperation_enum_old" USING "kanbanAggregateOperation"::"text"::"core"."view_kanbanaggregateoperation_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "core"."KanbanAggregateOperations"`);
    await queryRunner.query(
      `ALTER TYPE "core"."view_kanbanaggregateoperation_enum_old" RENAME TO "view_kanbanaggregateoperation_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."view_openrecordin_enum_old" AS ENUM('SIDE_PANEL', 'RECORD_PAGE')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "openRecordIn" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "openRecordIn" TYPE "core"."view_openrecordin_enum_old" USING "openRecordIn"::"text"::"core"."view_openrecordin_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."view" ALTER COLUMN "openRecordIn" SET DEFAULT 'SIDE_PANEL'`,
    );
    await queryRunner.query(`DROP TYPE "core"."ViewOpenRecordIn"`);
    await queryRunner.query(
      `ALTER TYPE "core"."view_openrecordin_enum_old" RENAME TO "view_openrecordin_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "core"."view" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "core"."ViewType"`);
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD "type" character varying NOT NULL DEFAULT 'table'`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."viewSort_direction_enum_old" AS ENUM('ASC', 'DESC')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" ALTER COLUMN "direction" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" ALTER COLUMN "direction" TYPE "core"."viewSort_direction_enum_old" USING "direction"::"text"::"core"."viewSort_direction_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewSort" ALTER COLUMN "direction" SET DEFAULT 'ASC'`,
    );
    await queryRunner.query(`DROP TYPE "core"."ViewSortDirection"`);
    await queryRunner.query(
      `ALTER TYPE "core"."viewSort_direction_enum_old" RENAME TO "viewSort_direction_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."viewFilterGroup_logicaloperator_enum_old" AS ENUM('AND', 'OR', 'NOT')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" ALTER COLUMN "logicalOperator" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" ALTER COLUMN "logicalOperator" TYPE "core"."viewFilterGroup_logicaloperator_enum_old" USING "logicalOperator"::"text"::"core"."viewFilterGroup_logicaloperator_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilterGroup" ALTER COLUMN "logicalOperator" SET DEFAULT 'NOT'`,
    );
    await queryRunner.query(
      `DROP TYPE "core"."ViewFilterGroupLogicalOperator"`,
    );
    await queryRunner.query(
      `ALTER TYPE "core"."viewFilterGroup_logicaloperator_enum_old" RENAME TO "viewFilterGroup_logicaloperator_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" DROP COLUMN "operand"`,
    );
    await queryRunner.query(`DROP TYPE "core"."ViewFilterOperand"`);
    await queryRunner.query(
      `ALTER TABLE "core"."viewFilter" ADD "operand" character varying NOT NULL DEFAULT 'Contains'`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."viewField_aggregateoperation_enum_old" AS ENUM('MIN', 'MAX', 'AVG', 'SUM', 'COUNT', 'COUNT_UNIQUE_VALUES', 'COUNT_EMPTY', 'COUNT_NOT_EMPTY', 'COUNT_TRUE', 'COUNT_FALSE', 'PERCENTAGE_EMPTY', 'PERCENTAGE_NOT_EMPTY')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."viewField" ALTER COLUMN "aggregateOperation" TYPE "core"."viewField_aggregateoperation_enum_old" USING "aggregateOperation"::"text"::"core"."viewField_aggregateoperation_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "core"."AggregateOperations"`);
    await queryRunner.query(
      `ALTER TYPE "core"."viewField_aggregateoperation_enum_old" RENAME TO "viewField_aggregateoperation_enum"`,
    );
  }
}
