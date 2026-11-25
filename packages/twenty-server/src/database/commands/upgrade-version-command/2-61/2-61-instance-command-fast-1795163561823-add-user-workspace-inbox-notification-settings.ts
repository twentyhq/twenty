import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.61.0', 1795163561823)
export class AddUserWorkspaceInboxNotificationSettingsFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."userWorkspace" ADD "inboxNotificationLevel" character varying NOT NULL DEFAULT \'ALL_FOLLOWED\'',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."userWorkspace" ADD "isInboxNotificationPreviewEnabled" boolean NOT NULL DEFAULT true',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."userWorkspace" DROP COLUMN "isInboxNotificationPreviewEnabled"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."userWorkspace" DROP COLUMN "inboxNotificationLevel"',
    );
  }
}
