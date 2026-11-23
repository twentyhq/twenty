import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.61.0', 1795087899814)
export class AddNavigationMenuItemBuiltInSectionKeyFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" ADD "builtInSectionKey" text',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DELETE FROM "core"."navigationMenuItem" WHERE "builtInSectionKey" IS NOT NULL',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."navigationMenuItem" DROP COLUMN "builtInSectionKey"',
    );
  }
}
