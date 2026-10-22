import { type DataSource, type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

const TWENTY_CLI_UNIVERSAL_IDENTIFIER = '20202020-82da-4d5a-afd2-53c52090f5e1';

@RegisteredInstanceCommand('2.51.0', 1792665115000, { type: 'slow' })
export class VetTwentyCliApplicationRegistrationSlowInstanceCommand implements SlowInstanceCommand {
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      `UPDATE "core"."applicationRegistration" SET "isVetted" = true WHERE "universalIdentifier" = $1`,
      [TWENTY_CLI_UNIVERSAL_IDENTIFIER],
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    return;
  }
}
