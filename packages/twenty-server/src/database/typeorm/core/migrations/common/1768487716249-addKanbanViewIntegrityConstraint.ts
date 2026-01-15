import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddKanbanViewIntegrityConstraint1768487716249
  implements MigrationInterface
{
  name = 'AddKanbanViewIntegrityConstraint1768487716249';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."view" ADD CONSTRAINT "CHK_VIEW_KANBAN_INTEGRITY" CHECK (("type" != 'KANBAN' OR "kanbanAggregateOperationFieldMetadataId" IS NOT NULL))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP CONSTRAINT "CHK_VIEW_KANBAN_INTEGRITY"`,
    );
  }
}
