import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.32.0', 1787053798069)
export class AddApplicationUninstallHookDeletionStateFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."workspace" ADD "applicationUninstallHooksCompletedAt" TIMESTAMP WITH TIME ZONE');
    await queryRunner.query('ALTER TABLE "core"."application" ADD "workspaceDeletionUninstallHookCompletedForDeletedAt" TIMESTAMP WITH TIME ZONE');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."application" DROP COLUMN "workspaceDeletionUninstallHookCompletedForDeletedAt"');
    await queryRunner.query('ALTER TABLE "core"."workspace" DROP COLUMN "applicationUninstallHooksCompletedAt"');
  }
}
