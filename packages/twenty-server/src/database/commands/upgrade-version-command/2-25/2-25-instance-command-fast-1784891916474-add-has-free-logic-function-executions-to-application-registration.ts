import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.25.0', 1784891916474)
export class AddHasFreeLogicFunctionExecutionsToApplicationRegistrationFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."applicationRegistration" ADD "hasFreeLogicFunctionExecutions" boolean NOT NULL DEFAULT false',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."applicationRegistration" DROP COLUMN "hasFreeLogicFunctionExecutions"',
    );
  }
}
