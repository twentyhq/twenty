import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.33.0', 1787304975901)
export class AddRunsWithUserAuthorityToLogicFunctionFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Left nullable on purpose: null marks a function declared before the
    // setting existed, which keeps the authority its trigger used to impose.
    await queryRunner.query(
      'ALTER TABLE "core"."logicFunction" ADD "runsWithUserAuthority" boolean',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."logicFunction" DROP COLUMN "runsWithUserAuthority"',
    );
  }
}
