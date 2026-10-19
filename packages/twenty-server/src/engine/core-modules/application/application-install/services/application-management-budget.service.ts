import { Inject, Injectable } from '@nestjs/common';

import { type Manifest } from 'twenty-shared/application';

import { countApplicationInstallFunctions } from 'src/engine/core-modules/application/application-install/utils/count-application-install-functions.util';
import { LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/logic-function-driver-factory.token';
import { type LogicFunctionManagementBudgetPriority } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import { type LogicFunctionDriverFactory } from 'src/engine/core-modules/logic-function/logic-function-drivers/logic-function-driver.factory';

@Injectable()
export class ApplicationManagementBudgetService {
  constructor(
    @Inject(LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN)
    private readonly logicFunctionDriverFactory: LogicFunctionDriverFactory,
  ) {}

  async allocateFunctions({
    functionCount,
    priority,
  }: {
    functionCount: number;
    priority: LogicFunctionManagementBudgetPriority;
  }): Promise<number> {
    const { admittedFunctionCount } = await this.logicFunctionDriverFactory
      .getCurrentDriver()
      .allocateManagementBudget({
        functionCount,
        priority,
        isPartialAllocationAllowed: true,
      });

    return admittedFunctionCount;
  }

  async allocateInstalls({
    manifest,
    isVersionUpgrade,
    priority,
    workspaceCount,
  }: {
    manifest: Manifest | null;
    isVersionUpgrade: boolean;
    priority: LogicFunctionManagementBudgetPriority;
    workspaceCount: number;
  }): Promise<number> {
    const functionCountPerInstall = countApplicationInstallFunctions({
      manifest,
      isVersionUpgrade,
    });

    if (functionCountPerInstall === 0) {
      return workspaceCount;
    }

    const driver = this.logicFunctionDriverFactory.getCurrentDriver();
    let admittedWorkspaceCount = 0;

    while (admittedWorkspaceCount < workspaceCount) {
      const { admittedFunctionCount } = await driver.allocateManagementBudget({
        functionCount: functionCountPerInstall,
        priority,
        isPartialAllocationAllowed: false,
      });

      if (admittedFunctionCount === 0) {
        break;
      }

      admittedWorkspaceCount++;
    }

    return admittedWorkspaceCount;
  }
}
