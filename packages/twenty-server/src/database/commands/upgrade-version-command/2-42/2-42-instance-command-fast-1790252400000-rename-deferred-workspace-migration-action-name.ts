import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.42.0', 1790252400000)
export class RenameDeferredWorkspaceMigrationActionNameFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."deferredWorkspaceMigrationAction" RENAME COLUMN "actionHandlerKey" TO "name"');
    await queryRunner.query('DELETE FROM "core"."deferredWorkspaceMigrationAction"');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."deferredWorkspaceMigrationAction" RENAME COLUMN "name" TO "actionHandlerKey"');
  }
}
