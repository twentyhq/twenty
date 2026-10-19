import { Inject, Injectable } from '@nestjs/common';

import { type Manifest } from 'twenty-shared/application';

import { countApplicationInstallDeployments } from 'src/engine/core-modules/application/application-install/utils/count-application-install-deployments.util';
import { LOGIC_FUNCTION_DRIVER_FACTORY_TOKEN } from 'src/engine/core-modules/logic-function/logic-function-drivers/constants/logic-function-driver-factory.token';
import {
  type LogicFunctionDeploymentPriority,
  type LogicFunctionDeploymentReservation,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import { type LogicFunctionDriverFactory } from 'src/engine/core-modules/logic-function/logic-function-drivers/logic-function-driver.factory';

@Injectable()
export class ApplicationDeploymentBudgetService {
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
    priority: LogicFunctionDeploymentPriority;
  }): Promise<LogicFunctionDeploymentReservation> {
    return this.logicFunctionDriverFactory
      .getCurrentDriver()
      .reserveDeployments({
        deploymentCount: countApplicationInstallDeployments({
          manifest,
          isVersionUpgrade,
        }),
        priority,
      });
  }
}
