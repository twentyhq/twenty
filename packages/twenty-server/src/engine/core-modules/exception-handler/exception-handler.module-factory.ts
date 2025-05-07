import { HttpAdapterHost } from '@nestjs/core';

import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';

import { OPTIONS_TYPE } from 'src/engine/core-modules/exception-handler/exception-handler.module-definition';
import { ExceptionHandlerDriver } from 'src/engine/core-modules/exception-handler/interfaces';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

/**
 * ExceptionHandler Module factory
 * @returns ExceptionHandlerModuleOptions
 * @param twentyConfigService
 * @param adapterHost
 */
export const exceptionHandlerModuleFactory = async (
  twentyConfigService: TwentyConfigService,
  adapterHost: HttpAdapterHost,
): Promise<typeof OPTIONS_TYPE> => {
  const driverType = twentyConfigService.get('EXCEPTION_HANDLER_DRIVER');

  switch (driverType) {
    case ExceptionHandlerDriver.Console: {
      return {
        type: ExceptionHandlerDriver.Console,
      };
    }
    case ExceptionHandlerDriver.Sentry: {
      return {
        type: ExceptionHandlerDriver.Sentry,
        options: {
          environment: twentyConfigService.get('SENTRY_ENVIRONMENT'),
          release: twentyConfigService.get('APP_VERSION'),
          dsn: twentyConfigService.get('SENTRY_DSN') ?? '',
          serverInstance: adapterHost.httpAdapter?.getInstance(),
          debug:
            twentyConfigService.get('NODE_ENV') === NodeEnvironment.development,
        },
      };
    }
    default:
      throw new Error(
        `Invalid exception capturer driver type (${driverType}), check your .env file`,
      );
  }
};
