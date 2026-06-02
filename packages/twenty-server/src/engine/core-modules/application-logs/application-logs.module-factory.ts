import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

import { type OPTIONS_TYPE } from 'src/engine/core-modules/application-logs/application-logs.module-definition';
import { ApplicationLogDriver } from 'src/engine/core-modules/application-logs/interfaces/application-log-driver.enum';

export const applicationLogsModuleFactory = async (
  twentyConfigService: TwentyConfigService,
): Promise<typeof OPTIONS_TYPE> => {
  const driverType = twentyConfigService.get('APPLICATION_LOG_DRIVER');

  return {
    type: driverType as ApplicationLogDriver,
  };
};
