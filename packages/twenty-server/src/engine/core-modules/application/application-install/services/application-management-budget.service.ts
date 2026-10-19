import { Inject, Injectable } from '@nestjs/common';

import { LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/logic-function-driver-factory.token';
import { type LogicFunctionAvailableManagementBudget } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import { type LogicFunctionDriverFactory } from 'src/engine/core-modules/logic-function/logic-function-drivers/logic-function-driver.factory';

@Injectable()
export class ApplicationManagementBudgetService {
  constructor(
    @Inject(LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN)
    private readonly logicFunctionDriverFactory: LogicFunctionDriverFactory,
  ) {}

  getAvailableBudget(): Promise<LogicFunctionAvailableManagementBudget> {
    return this.logicFunctionDriverFactory
      .getCurrentDriver()
      .getAvailableManagementBudget();
  }

  async recordFunctionUsage({
    functionCount,
  }: {
    functionCount: number;
  }): Promise<void> {
    await this.logicFunctionDriverFactory
      .getCurrentDriver()
      .allocateManagementBudget({ functionCount });
  }
}
