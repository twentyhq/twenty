import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.58.0', 1794303581057)
export class AddViewOwnerUserWorkspaceFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."view" ADD "ownerUserWorkspaceId" uuid');
    await queryRunner.query('CREATE INDEX "IDX_VIEW_OWNER_USER_WORKSPACE" ON "core"."view" ("ownerUserWorkspaceId") ');
    await queryRunner.query('ALTER TABLE "core"."view" ADD CONSTRAINT "FK_eaeae9d6f0e6f1a97e6950c4a51" FOREIGN KEY ("ownerUserWorkspaceId") REFERENCES "core"."userWorkspace"("id") ON DELETE SET NULL ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."view" DROP CONSTRAINT "FK_eaeae9d6f0e6f1a97e6950c4a51"');
    await queryRunner.query('DROP INDEX "core"."IDX_VIEW_OWNER_USER_WORKSPACE"');
    await queryRunner.query('ALTER TABLE "core"."view" DROP COLUMN "ownerUserWorkspaceId"');
  }
}
