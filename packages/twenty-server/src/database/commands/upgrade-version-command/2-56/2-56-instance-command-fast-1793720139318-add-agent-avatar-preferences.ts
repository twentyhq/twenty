import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.56.0', 1793720139318)
export class AddAgentAvatarPreferencesFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."agent" ADD "avatarColor" character varying');
    await queryRunner.query('ALTER TABLE "core"."agent" ADD "avatarShape" character varying');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('ALTER TABLE "core"."agent" DROP COLUMN "avatarShape"');
    await queryRunner.query('ALTER TABLE "core"."agent" DROP COLUMN "avatarColor"');
  }
}
