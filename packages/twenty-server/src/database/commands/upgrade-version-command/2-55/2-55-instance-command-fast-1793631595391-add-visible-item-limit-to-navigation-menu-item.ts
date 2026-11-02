import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.55.0', 1793631595391)
export class AddVisibleItemLimitToNavigationMenuItemFastInstanceCommand implements FastInstanceCommand {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" ADD "visibleItemLimit" integer',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" DROP COLUMN "visibleItemLimit"',
    );
  }
}
