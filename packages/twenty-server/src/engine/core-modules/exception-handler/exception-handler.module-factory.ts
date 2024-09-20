import { HttpAdapterHost } from '@nestjs/core';

import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { OPTIONS_TYPE } from 'src/engine/core-modules/exception-handler/exception-handler.module-definition';
import { ExceptionHandlerDriver } from 'src/engine/core-modules/exception-handler/interfaces';

/**
 * ExceptionHandler Module factory
 * @returns ExceptionHandlerModuleOptions
 * @param environmentService
 * @param adapterHost
 */
export const exceptionHandlerModuleFactory = async (
  environmentService: EnvironmentService,
  adapterHost: HttpAdapterHost,
): Promise<typeof OPTIONS_TYPE> => {
  const driverType = environmentService.get('EXCEPTION_HANDLER_DRIVER');

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
          environment: environmentService.get('SENTRY_ENVIRONMENT'),
          release: environmentService.get('SENTRY_RELEASE'),
          dsn: environmentService.get('SENTRY_DSN') ?? '',
          serverInstance: adapterHost.httpAdapter?.getInstance(),
          debug: environmentService.get('DEBUG_MODE'),
        },
      };
    }
    default:
      throw new Error(
        `Invalid exception capturer driver type (${driverType}), check your .env file`,
      );
  }
};
