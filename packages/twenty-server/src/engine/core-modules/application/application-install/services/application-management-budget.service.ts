import { Inject, Injectable } from '@nestjs/common';

import {
  type ApplicationInstallFunctionsManifest,
  countApplicationInstallFunctions,
} from 'src/engine/core-modules/application/application-install/utils/count-application-install-functions.util';
import { LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/logic-function-driver-factory.token';
import {
  type LogicFunctionAvailableManagementBudget,
  type LogicFunctionManagementBudgetPriority,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import { type LogicFunctionDriverFactory } from 'src/engine/core-modules/logic-function/logic-function-drivers/logic-function-driver.factory';

@Injectable()
export class ApplicationManagementBudgetService {
  constructor(
    @Inject(LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN)
    private readonly logicFunctionDriverFactory: LogicFunctionDriverFactory,
  ) {}

  getAvailableBudget({
    priority,
  }: {
    priority: LogicFunctionManagementBudgetPriority;
  }): Promise<LogicFunctionAvailableManagementBudget> {
    return this.logicFunctionDriverFactory
      .getCurrentDriver()
      .getAvailableManagementBudget({ priority });
  }

  async allocateFunctions({
    functionCount,
    priority,
  }: {
    functionCount: number;
    priority: LogicFunctionManagementBudgetPriority;
  }): Promise<number> {
    const { admittedFunctionCount } = await this.logicFunctionDriverFactory
      .getCurrentDriver()
      .allocateManagementBudget({ functionCount, priority });

    return admittedFunctionCount;
  }

  // Spends the fitting installs from availableBudget so later callers see what is left
  spendAffordableInstalls({
    manifest,
    isVersionUpgrade,
    workspaceCount,
    availableBudget,
  }: {
    manifest: ApplicationInstallFunctionsManifest | null;
    isVersionUpgrade: boolean;
    workspaceCount: number;
    availableBudget: LogicFunctionAvailableManagementBudget;
  }): number {
    // An install bigger than the whole budget still fits once the budget is full
    const functionCountPerInstall = Math.min(
      countApplicationInstallFunctions({ manifest, isVersionUpgrade }),
      availableBudget.maxFunctionCount,
    );

    if (functionCountPerInstall === 0) {
      return workspaceCount;
    }

    const affordableInstallCount = Math.min(
      workspaceCount,
      Math.floor(
        availableBudget.availableFunctionCount / functionCountPerInstall,
      ),
    );

    availableBudget.availableFunctionCount -=
      affordableInstallCount * functionCountPerInstall;

    return affordableInstallCount;
  }
}
