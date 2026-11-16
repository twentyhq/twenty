import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.59.0', 1794508996000)
export class RenameDeferredWorkspaceMigrationActionToDeferredWorkspaceOperationFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."deferredWorkspaceMigrationAction" RENAME TO "deferredWorkspaceOperation"',
    );
    await queryRunner.query(
      'ALTER INDEX "core"."IDX_DEFERRED_WORKSPACE_MIGRATION_ACTION_WORKSPACE_ID_STATUS" RENAME TO "IDX_DEFERRED_WORKSPACE_OPERATION_WORKSPACE_ID_STATUS"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."deferredWorkspaceOperation" RENAME CONSTRAINT "PK_eb96f18b805c453f3375b9d1aea" TO "PK_c42e6d7a0bef682c6183ed7324c"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."deferredWorkspaceOperation" RENAME CONSTRAINT "FK_c3810cd3a6109f5e1bf6f84c60f" TO "FK_06e51a1b028fc008516500af503"',
    );
    // TODO(@charlesBochet): drop this view in the next version, it only keeps pods still on the pre-rename code working during the rollout
    await queryRunner.query(
      'CREATE VIEW "core"."deferredWorkspaceMigrationAction" AS SELECT * FROM "core"."deferredWorkspaceOperation"',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP VIEW "core"."deferredWorkspaceMigrationAction"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."deferredWorkspaceOperation" RENAME CONSTRAINT "FK_06e51a1b028fc008516500af503" TO "FK_c3810cd3a6109f5e1bf6f84c60f"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."deferredWorkspaceOperation" RENAME CONSTRAINT "PK_c42e6d7a0bef682c6183ed7324c" TO "PK_eb96f18b805c453f3375b9d1aea"',
    );
    await queryRunner.query(
      'ALTER INDEX "core"."IDX_DEFERRED_WORKSPACE_OPERATION_WORKSPACE_ID_STATUS" RENAME TO "IDX_DEFERRED_WORKSPACE_MIGRATION_ACTION_WORKSPACE_ID_STATUS"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."deferredWorkspaceOperation" RENAME TO "deferredWorkspaceMigrationAction"',
    );
  }
}
