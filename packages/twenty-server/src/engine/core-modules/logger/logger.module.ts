import {
  ConsoleLogger,
  type DynamicModule,
  Global,
  Module,
} from '@nestjs/common';

import { LoggerDriverType } from 'src/engine/core-modules/logger/interfaces';
import { LOGGER_DRIVER } from 'src/engine/core-modules/logger/logger.constants';
import {
  type ASYNC_OPTIONS_TYPE,
  ConfigurableModuleClass,
  type OPTIONS_TYPE,
} from 'src/engine/core-modules/logger/logger.module-definition';
import { LoggerService } from 'src/engine/core-modules/logger/logger.service';

@Global()
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule extends ConfigurableModuleClass {
  static forRoot(options: typeof OPTIONS_TYPE): DynamicModule {
    const provider = {
      provide: LOGGER_DRIVER,
      useValue:
        options.type === LoggerDriverType.CONSOLE
          ? new ConsoleLogger()
          : undefined,
    };
    const dynamicModule = super.forRoot(options);

    return {
      ...dynamicModule,
      providers: [...(dynamicModule.providers ?? []), provider],
    };
  }

  static forRootAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    const provider = {
      provide: LOGGER_DRIVER,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useFactory: async (...args: any[]) => {
        const config = await options?.useFactory?.(...args);

        if (!config) {
          return null;
        }

        const logLevels = config.logLevels ?? [];

        const logger =
          config?.type === LoggerDriverType.CONSOLE
            ? new ConsoleLogger()
            : undefined;

        logger?.setLogLevels(logLevels);

        return logger;
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
