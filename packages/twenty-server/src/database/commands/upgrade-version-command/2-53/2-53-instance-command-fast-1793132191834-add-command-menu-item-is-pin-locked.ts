import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.53.0', 1793132191834)
export class AddCommandMenuItemIsPinLockedFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."commandMenuItem" ADD "isPinLocked" boolean NOT NULL DEFAULT false',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."commandMenuItem" DROP COLUMN "isPinLocked"',
    );
  }
}
