import { type DynamicModule, Global, Module } from '@nestjs/common';

import { ExceptionHandlerConsoleDriver } from 'src/engine/core-modules/exception-handler/drivers/console.driver';
import { ExceptionHandlerSentryDriver } from 'src/engine/core-modules/exception-handler/drivers/sentry.driver';
import { EXCEPTION_HANDLER_DRIVER } from 'src/engine/core-modules/exception-handler/exception-handler.constants';
import {
  type ASYNC_OPTIONS_TYPE,
  ConfigurableModuleClass,
  type OPTIONS_TYPE,
} from 'src/engine/core-modules/exception-handler/exception-handler.module-definition';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import { ExceptionHandlerDriver } from 'src/engine/core-modules/exception-handler/interfaces';

@Global()
@Module({
  providers: [ExceptionHandlerService, HttpExceptionHandlerService],
  exports: [ExceptionHandlerService, HttpExceptionHandlerService],
})
export class ExceptionHandlerModule extends ConfigurableModuleClass {
  static forRoot(options: typeof OPTIONS_TYPE): DynamicModule {
    const provider = {
      provide: EXCEPTION_HANDLER_DRIVER,
      useValue:
        options.type === ExceptionHandlerDriver.CONSOLE
          ? new ExceptionHandlerConsoleDriver()
          : new ExceptionHandlerSentryDriver(),
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useFactory: async (...args: any[]) => {
        const config = await options?.useFactory?.(...args);

        if (!config) {
          return null;
        }

        return config.type === ExceptionHandlerDriver.CONSOLE
          ? new ExceptionHandlerConsoleDriver()
          : new ExceptionHandlerSentryDriver();
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
