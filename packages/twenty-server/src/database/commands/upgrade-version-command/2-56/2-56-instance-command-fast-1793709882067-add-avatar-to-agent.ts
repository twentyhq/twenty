import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.56.0', 1793709882067)
export class AddAvatarToAgentFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."agent" ADD COLUMN IF NOT EXISTS "avatarColor" character varying',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agent" ADD COLUMN IF NOT EXISTS "avatarShape" character varying',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."agent" DROP COLUMN IF EXISTS "avatarShape"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."agent" DROP COLUMN IF EXISTS "avatarColor"',
    );
  }
}
