import { QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { FastInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/fast-instance-command.interface';

// Universal identifiers of the first-party apps whose per-record triggers run
// during mailbox/calendar import and should not consume the workspace's
// credits (Call Recorder, Last contact).
const BILLING_EXEMPT_UNIVERSAL_IDENTIFIERS = [
  '8da4b8b5-5edf-4880-b51f-ab6e679ec617',
  '66a504cc-0a75-410e-a43f-cdeae1db1522',
];

@RegisteredInstanceCommand('2.24.0', 1785200000000)
export class AddHasFreeLogicFunctionExecutionsToApplicationRegistrationFastInstanceCommand
  implements FastInstanceCommand
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."applicationRegistration" ADD "hasFreeLogicFunctionExecutions" boolean NOT NULL DEFAULT false',
    );

    await queryRunner.query(
      'UPDATE "core"."applicationRegistration" SET "hasFreeLogicFunctionExecutions" = true WHERE "universalIdentifier" = ANY($1)',
      [BILLING_EXEMPT_UNIVERSAL_IDENTIFIERS],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."applicationRegistration" DROP COLUMN "hasFreeLogicFunctionExecutions"',
    );
  }
}
