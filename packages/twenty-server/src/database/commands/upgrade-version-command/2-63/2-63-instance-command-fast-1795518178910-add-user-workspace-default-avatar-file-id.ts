import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.63.0', 1795518178910)
export class AddUserWorkspaceDefaultAvatarFileIdFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."userWorkspace" ADD "defaultAvatarFileId" uuid');
    await queryRunner.query('CREATE INDEX "IDX_USER_WORKSPACE_DEFAULT_AVATAR_FILE_ID" ON "core"."userWorkspace" ("defaultAvatarFileId") ');
    await queryRunner.query('ALTER TABLE "core"."userWorkspace" ADD CONSTRAINT "FK_d6f7170172e611dd7b8353211c1" FOREIGN KEY ("defaultAvatarFileId") REFERENCES "core"."file"("id") ON DELETE SET NULL ON UPDATE NO ACTION');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."userWorkspace" DROP CONSTRAINT "FK_d6f7170172e611dd7b8353211c1"');
    await queryRunner.query('DROP INDEX "core"."IDX_USER_WORKSPACE_DEFAULT_AVATAR_FILE_ID"');
    await queryRunner.query('ALTER TABLE "core"."userWorkspace" DROP COLUMN "defaultAvatarFileId"');
  }
}
