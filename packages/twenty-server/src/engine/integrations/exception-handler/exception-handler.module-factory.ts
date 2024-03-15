import { HttpAdapterHost } from '@nestjs/core';

import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import { OPTIONS_TYPE } from 'src/engine/integrations/exception-handler/exception-handler.module-definition';
import { ExceptionHandlerDriver } from 'src/engine/integrations/exception-handler/interfaces';

/**
 * ExceptionHandler Module factory
 * @param environment
 * @returns ExceptionHandlerModuleOptions
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
