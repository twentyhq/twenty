import {
  LoggerDriverType,
  type LoggerModuleOptions,
} from 'src/engine/core-modules/logger/interfaces';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

/**
 * Logger Module factory
 * @returns LoggerModuleOptions
 * @param twentyConfigService
 */
export const loggerModuleFactory = async (
  twentyConfigService: TwentyConfigService,
): Promise<LoggerModuleOptions> => {
  const driverType = twentyConfigService.get('LOGGER_DRIVER');
  const logLevels = twentyConfigService.get('LOG_LEVELS');

  switch (driverType) {
    case LoggerDriverType.CONSOLE: {
      return {
        type: LoggerDriverType.CONSOLE,
        logLevels: logLevels,
      };
    }
    default:
      throw new Error(
        `Invalid logger driver type (${driverType}), check your .env file`,
      );
  }
};
