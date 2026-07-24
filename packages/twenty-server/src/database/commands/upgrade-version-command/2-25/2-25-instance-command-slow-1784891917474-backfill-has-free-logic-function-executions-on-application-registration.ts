import { DataSource, QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

// First-party apps whose per-record triggers run during mailbox/calendar
// import and should not consume the workspace's credits (Call Recorder,
// Last contact).
const BILLING_EXEMPT_UNIVERSAL_IDENTIFIERS = [
  '8da4b8b5-5edf-4880-b51f-ab6e679ec617',
  '66a504cc-0a75-410e-a43f-cdeae1db1522',
];

@RegisteredInstanceCommand('2.25.0', 1784891917474, { type: 'slow' })
export class BackfillHasFreeLogicFunctionExecutionsOnApplicationRegistrationSlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      `UPDATE "core"."applicationRegistration"
       SET "hasFreeLogicFunctionExecutions" = true
       WHERE "universalIdentifier" = ANY($1::uuid[])`,
      [BILLING_EXEMPT_UNIVERSAL_IDENTIFIERS],
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {}

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "core"."applicationRegistration"
       SET "hasFreeLogicFunctionExecutions" = false
       WHERE "universalIdentifier" = ANY($1::uuid[])`,
      [BILLING_EXEMPT_UNIVERSAL_IDENTIFIERS],
    );
  }
}
