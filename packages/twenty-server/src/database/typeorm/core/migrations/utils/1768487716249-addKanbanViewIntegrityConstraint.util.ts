import { type QueryRunner } from 'typeorm';

export const addKanbanViewIntegrityConstraintQueries = async (
  queryRunner: QueryRunner,
): Promise<void> => {
  await queryRunner.query(
    `ALTER TABLE "core"."view" DROP CONSTRAINT IF EXISTS "CHK_VIEW_KANBAN_INTEGRITY"`,
  );
  await queryRunner.query(
    `ALTER TABLE "core"."view" ADD CONSTRAINT "CHK_VIEW_KANBAN_INTEGRITY" CHECK (("type" != 'KANBAN' OR "kanbanAggregateOperationFieldMetadataId" IS NOT NULL))`,
  );
};
