import { type MigrationInterface, type QueryRunner } from 'typeorm';

import { addKanbanViewIntegrityConstraintQueries } from 'src/database/typeorm/core/migrations/utils/1768487716249-addKanbanViewIntegrityConstraint.util';

export class AddKanbanViewIntegrityConstraint1768487716249
  implements MigrationInterface
{
  name = 'AddKanbanViewIntegrityConstraint1768487716249';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const savepointName = 'sp_add_kanban_view_integrity_constraint';

    try {
      await queryRunner.query(`SAVEPOINT ${savepointName}`);

      await addKanbanViewIntegrityConstraintQueries(queryRunner);

      await queryRunner.query(`RELEASE SAVEPOINT ${savepointName}`);
    } catch (e) {
      try {
        await queryRunner.query(`ROLLBACK TO SAVEPOINT ${savepointName}`);
        await queryRunner.query(`RELEASE SAVEPOINT ${savepointName}`);
      } catch (rollbackError) {
        // eslint-disable-next-line no-console
        console.error(
          'Failed to rollback to savepoint in AddKanbanViewIntegrityConstraint1768487716249',
          rollbackError,
        );
        throw rollbackError;
      }

      // Swallow error - upgrade command handles data cleanup for existing workspaces
      // eslint-disable-next-line no-console
      console.warn(
        'AddKanbanViewIntegrityConstraint1768487716249 failed, upgrade:1-16:fix-kanban-view-integrity command will handle cleanup',
        e,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."view" DROP CONSTRAINT IF EXISTS "CHK_VIEW_KANBAN_INTEGRITY"`,
    );
  }
}
