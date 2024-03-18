import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import {
  LoggerModuleOptions,
  LoggerDriverType,
} from 'src/engine/integrations/logger/interfaces';

/**
 * Logger Module factory
 * @param environment
 * @returns LoggerModuleOptions
 */
export const loggerModuleFactory = async (
  environmentService: EnvironmentService,
): Promise<LoggerModuleOptions> => {
  const driverType = environmentService.get('LOGGER_DRIVER');
  const logLevels = environmentService.get('LOG_LEVELS');

  switch (driverType) {
    case LoggerDriverType.Console: {
      return {
        type: LoggerDriverType.Console,
        logLevels: logLevels,
      };
    }
    default:
      throw new Error(
        `Invalid logger driver type (${driverType}), check your .env file`,
      );
  }
};
