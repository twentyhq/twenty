import { DataSource } from 'typeorm';

import { RegisteredInstanceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-instance-command.decorator';
import { SlowInstanceCommand } from 'src/engine/core-modules/upgrade/interfaces/slow-instance-command.interface';
import { LogicFunctionExecutorDriverFactory } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor-driver.factory';

@RegisteredInstanceCommand('2.25.0', 1784921879702, { type: 'slow' })
export class SetPackagedApplicationLogicFunctionExecutionModeSlowInstanceCommand
  implements SlowInstanceCommand
{
  constructor(
    private readonly driverFactory: LogicFunctionExecutorDriverFactory,
  ) {}

  async runDataMigration(dataSource: DataSource): Promise<void> {
    const [updatedLogicFunctions] = await dataSource.query(`
      UPDATE "core"."logicFunction"
      SET "executionMode" = 'PREBUILT'
      WHERE "sourceType" IN ('tarball', 'npm')
        AND "builtHandlerChecksum" IS NOT NULL
        AND "builtHandlerChecksum" <> ''
      RETURNING "id", "workspaceId", "applicationId";
    `);

    const driver = this.driverFactory.getCurrentDriver();

    for (const logicFunction of updatedLogicFunctions) {
      await driver.installPrebuiltBundle({
        logicFunctionId: logicFunction.id,
        workspaceId: logicFunction.workspaceId,
        applicationId: logicFunction.applicationId,
      });
    }
  }

  async down(dataSource: DataSource): Promise<void> {
    await dataSource.query(`
      UPDATE "core"."logicFunction"
      SET "executionMode" = 'LIVE'
      WHERE "sourceType" IN ('tarball', 'npm');
    `);
  }
}
