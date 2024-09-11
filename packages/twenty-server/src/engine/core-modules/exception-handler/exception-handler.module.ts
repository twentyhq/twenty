import { DynamicModule, Global, Module } from '@nestjs/common';

import { ExceptionHandlerSentryDriver } from 'src/engine/core-modules/exception-handler/drivers/sentry.driver';
import { ExceptionHandlerConsoleDriver } from 'src/engine/core-modules/exception-handler/drivers/console.driver';

import { ExceptionHandlerService } from 'packages/twenty-server/src/engine/core-modules/exception-handler/exception-handler.service';
import { ExceptionHandlerDriver } from 'packages/twenty-server/src/engine/core-modules/exception-handler/interfaces';
import { EXCEPTION_HANDLER_DRIVER } from 'packages/twenty-server/src/engine/core-modules/exception-handler/exception-handler.constants';
import {
  ConfigurableModuleClass,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} from 'packages/twenty-server/src/engine/core-modules/exception-handler/exception-handler.module-definition';

@Global()
@Module({
  providers: [ExceptionHandlerService],
  exports: [ExceptionHandlerService],
})
export class ExceptionHandlerModule extends ConfigurableModuleClass {
  static forRoot(options: typeof OPTIONS_TYPE): DynamicModule {
    const provider = {
      provide: EXCEPTION_HANDLER_DRIVER,
      useValue:
        options.type === ExceptionHandlerDriver.Console
          ? new ExceptionHandlerConsoleDriver()
          : new ExceptionHandlerSentryDriver(options.options),
    };
    const dynamicModule = super.forRoot(options);

    return {
      ...dynamicModule,
      providers: [...(dynamicModule.providers ?? []), provider],
    };
  }

  static forRootAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    const provider = {
      provide: EXCEPTION_HANDLER_DRIVER,
      useFactory: async (...args: any[]) => {
        const config = await options?.useFactory?.(...args);

        if (!config) {
          return null;
        }

        return config.type === ExceptionHandlerDriver.Console
          ? new ExceptionHandlerConsoleDriver()
          : new ExceptionHandlerSentryDriver(config.options);
      },
      inject: options.inject || [],
    };
    const dynamicModule = super.forRootAsync(options);

    return {
      ...dynamicModule,
      providers: [...(dynamicModule.providers ?? []), provider],
    };
  }
}
