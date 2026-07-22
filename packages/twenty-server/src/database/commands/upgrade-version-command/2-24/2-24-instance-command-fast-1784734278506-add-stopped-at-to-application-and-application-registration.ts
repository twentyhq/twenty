import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

@RegisteredInstanceCommand('2.24.0', 1784734278506)
export class AddStoppedAtToApplicationAndApplicationRegistrationFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."application" ADD COLUMN IF NOT EXISTS "stoppedAt" TIMESTAMP WITH TIME ZONE',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."applicationRegistration" ADD COLUMN IF NOT EXISTS "stoppedAt" TIMESTAMP WITH TIME ZONE',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."applicationRegistration" DROP COLUMN IF EXISTS "stoppedAt"',
    );
    await queryRunner.query(
      'ALTER TABLE "core"."application" DROP COLUMN IF EXISTS "stoppedAt"',
    );
  }
}
