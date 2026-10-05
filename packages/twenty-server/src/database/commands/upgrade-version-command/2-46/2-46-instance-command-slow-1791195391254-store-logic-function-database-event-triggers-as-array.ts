import { type DataSource, type QueryRunner } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { type SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';

// A logic function used to hold a single database event trigger object; it now
// holds a list of them
@RegisteredInstanceCommand('2.46.0', 1791195391254, { type: 'slow' })
export class StoreLogicFunctionDatabaseEventTriggersAsArraySlowInstanceCommand
  implements SlowInstanceCommand
{
  async runDataMigration(dataSource: DataSource): Promise<void> {
    await dataSource.query(
      `UPDATE "core"."logicFunction"
          SET "databaseEventTriggerSettings" = jsonb_build_array("databaseEventTriggerSettings")
        WHERE jsonb_typeof("databaseEventTriggerSettings") = 'object'`,
    );
  }

  public async up(_queryRunner: QueryRunner): Promise<void> {
    return;
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // The previous shape holds one trigger, so only the first one survives
    await queryRunner.query(
      `UPDATE "core"."logicFunction"
          SET "databaseEventTriggerSettings" = "databaseEventTriggerSettings" -> 0
        WHERE jsonb_typeof("databaseEventTriggerSettings") = 'array'`,
    );
  }
}
