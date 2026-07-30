import { type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.26.0', 1785378891192)
export class AddOnDisconnectLogicFunctionToConnectionProviderFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."connectionProvider" ADD COLUMN IF NOT EXISTS "onDisconnectLogicFunctionUniversalIdentifier" uuid',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."connectionProvider" DROP COLUMN IF EXISTS "onDisconnectLogicFunctionUniversalIdentifier"',
    );
  }
}
