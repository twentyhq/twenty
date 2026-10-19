import { Inject, Injectable } from '@nestjs/common';

import { type Manifest } from 'twenty-shared/application';

import { countApplicationInstallFunctions } from 'src/engine/core-modules/application/application-install/utils/count-application-install-functions.util';
import { LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/logic-function-driver-factory.token';
import {
  type LogicFunctionManagementBudgetPriority,
  type LogicFunctionManagementBudgetReservation,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import { type LogicFunctionDriverFactory } from 'src/engine/core-modules/logic-function/logic-function-drivers/logic-function-driver.factory';

@Injectable()
export class ApplicationManagementBudgetService {
  constructor(
    @Inject(LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN)
    private readonly logicFunctionDriverFactory: LogicFunctionDriverFactory,
  ) {}

  reserveInstall({
    manifest,
    isVersionUpgrade,
    priority,
  }: {
    manifest: Manifest | null;
    isVersionUpgrade: boolean;
    priority: LogicFunctionManagementBudgetPriority;
  }): Promise<LogicFunctionManagementBudgetReservation> {
    return this.logicFunctionDriverFactory
      .getCurrentDriver()
      .reserveManagementBudget({
        functionCount: countApplicationInstallFunctions({
          manifest,
          isVersionUpgrade,
        }),
        priority,
      });
  }

  async reserveInstalls({
    manifest,
    isVersionUpgrade,
    priority,
    workspaceCount,
  }: {
    manifest: Manifest | null;
    isVersionUpgrade: boolean;
    priority: LogicFunctionManagementBudgetPriority;
    workspaceCount: number;
  }): Promise<LogicFunctionManagementBudgetReservation[]> {
    const functionCountPerInstall = countApplicationInstallFunctions({
      manifest,
      isVersionUpgrade,
    });

    const reservation = await this.logicFunctionDriverFactory
      .getCurrentDriver()
      .reserveManagementBudget({
        functionCount: functionCountPerInstall * workspaceCount,
        priority,
      });

    return Array.from({ length: workspaceCount }, (_, workspaceIndex) => ({
      ...reservation,
      startsAt:
        reservation.startsAt +
        workspaceIndex *
          functionCountPerInstall *
          reservation.functionIntervalMs,
    }));
  }
}
