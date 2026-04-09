import { type DynamicModule, Global, Module } from '@nestjs/common';

import { ClickHouseModule } from 'src/database/clickHouse/clickHouse.module';
import { ClickHouseService } from 'src/database/clickHouse/clickHouse.service';
import { APPLICATION_LOG_DRIVER } from 'src/engine/core-modules/application-logs/application-logs.constants';
import {
  type ASYNC_OPTIONS_TYPE,
  ConfigurableModuleClass,
  type OPTIONS_TYPE,
} from 'src/engine/core-modules/application-logs/application-logs.module-definition';
import { ApplicationLogsService } from 'src/engine/core-modules/application-logs/application-logs.service';
import { ClickHouseApplicationLogDriver } from 'src/engine/core-modules/application-logs/drivers/clickhouse.driver';
import { ConsoleApplicationLogDriver } from 'src/engine/core-modules/application-logs/drivers/console.driver';
import { DisabledApplicationLogDriver } from 'src/engine/core-modules/application-logs/drivers/disabled.driver';
import { ApplicationLogDriverType } from 'src/engine/core-modules/application-logs/interfaces/application-log-driver-type.enum';

@Global()
@Module({
  imports: [ClickHouseModule],
  providers: [ApplicationLogsService],
  exports: [ApplicationLogsService],
})
export class ApplicationLogsModule extends ConfigurableModuleClass {
  static forRoot(options: typeof OPTIONS_TYPE): DynamicModule {
    const provider = {
      provide: APPLICATION_LOG_DRIVER,
      useValue: ApplicationLogsModule.createDriver(options.type),
    };
    const dynamicModule = super.forRoot(options);

    return {
      ...dynamicModule,
      providers: [...(dynamicModule.providers ?? []), provider],
    };
  }

  static forRootAsync(options: typeof ASYNC_OPTIONS_TYPE): DynamicModule {
    const provider = {
      provide: APPLICATION_LOG_DRIVER,
      // oxlint-disable-next-line @typescripttypescript/no-explicit-any
      useFactory: async (
        clickHouseService: ClickHouseService,
        ...args: unknown[]
      ) => {
        const config = await options?.useFactory?.(...args);

        if (!config) {
          return new DisabledApplicationLogDriver();
        }

        return ApplicationLogsModule.createDriver(
          config.type,
          clickHouseService,
        );
      },
      inject: [ClickHouseService, ...(options.inject || [])],
    };
    const dynamicModule = super.forRootAsync(options);

    return {
      ...dynamicModule,
      providers: [...(dynamicModule.providers ?? []), provider],
    };
  }

  private static createDriver(
    type: ApplicationLogDriverType,
    clickHouseService?: ClickHouseService,
  ) {
    switch (type) {
      case ApplicationLogDriverType.CONSOLE:
        return new ConsoleApplicationLogDriver();
      case ApplicationLogDriverType.CLICKHOUSE:
        if (!clickHouseService) {
          throw new Error(
            'ClickHouseService is required for the ClickHouse application log driver',
          );
        }

        return new ClickHouseApplicationLogDriver(clickHouseService);
      case ApplicationLogDriverType.DISABLED:
      default:
        return new DisabledApplicationLogDriver();
    }
  }
}
