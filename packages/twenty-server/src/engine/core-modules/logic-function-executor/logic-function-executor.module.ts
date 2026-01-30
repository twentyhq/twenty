import { type DynamicModule, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AddPackagesCommand } from 'src/engine/core-modules/logic-function-executor/commands/add-packages.command';
import { DisabledDriver } from 'src/engine/core-modules/logic-function-executor/drivers/disabled.driver';
import { LambdaDriver } from 'src/engine/core-modules/logic-function-executor/drivers/lambda.driver';
import { LocalDriver } from 'src/engine/core-modules/logic-function-executor/drivers/local.driver';
import { LogicFunctionTriggerJob } from 'src/engine/core-modules/logic-function-executor/jobs/logic-function-trigger.job';
import { LogicFunctionBuildService } from 'src/engine/core-modules/logic-function-executor/logic-function-build.service';
import { LOGIC_FUNCTION_EXECUTOR_DRIVER } from 'src/engine/core-modules/logic-function-executor/logic-function-executor.constants';
import {
  LogicFunctionExecutorDriverType,
  type LogicFunctionExecutorModuleAsyncOptions,
} from 'src/engine/core-modules/logic-function-executor/logic-function-executor.interface';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function-executor/logic-function-executor.service';
import { LogicFunctionLayerService } from 'src/engine/core-modules/logic-function-executor/logic-function-layer.service';
import { CronTriggerCronCommand } from 'src/engine/core-modules/logic-function-executor/triggers/cron/cron-trigger.cron.command';
import { CronTriggerCronJob } from 'src/engine/core-modules/logic-function-executor/triggers/cron/cron-trigger.cron.job';
import { CallDatabaseEventTriggerJobsJob } from 'src/engine/core-modules/logic-function-executor/triggers/database-event/call-database-event-trigger-jobs.job';
import { RouteTriggerService } from 'src/engine/core-modules/logic-function-executor/triggers/route/route-trigger.service';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { LogicFunctionLayerEntity } from 'src/engine/metadata-modules/logic-function-layer/logic-function-layer.entity';

@Global()
export class LogicFunctionExecutorModule {
  static forRootAsync(
    options: LogicFunctionExecutorModuleAsyncOptions,
  ): DynamicModule {
    const provider = {
      provide: LOGIC_FUNCTION_EXECUTOR_DRIVER,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useFactory: async (...args: any[]) => {
        const config = await options.useFactory(...args);

        switch (config?.type) {
          case LogicFunctionExecutorDriverType.DISABLED:
            return new DisabledDriver();
          case LogicFunctionExecutorDriverType.LOCAL:
            return new LocalDriver(config.options);
          case LogicFunctionExecutorDriverType.LAMBDA:
            return new LambdaDriver(config.options);
          default: {
            const unknownConfig = config as { type?: string };

            throw new Error(
              `Unknown logic function executor driver type: ${unknownConfig?.type}`,
            );
          }
        }
      },
      inject: options.inject || [],
    };

    return {
      module: LogicFunctionExecutorModule,
      imports: [
        TypeOrmModule.forFeature([
          LogicFunctionLayerEntity,
          LogicFunctionEntity,
          WorkspaceEntity,
        ]),
        ...(options.imports || []),
      ],
      providers: [
        LogicFunctionExecutorService,
        LogicFunctionBuildService,
        LogicFunctionLayerService,
        LogicFunctionTriggerJob,
        CronTriggerCronJob,
        CronTriggerCronCommand,
        CallDatabaseEventTriggerJobsJob,
        RouteTriggerService,
        provider,
        AddPackagesCommand,
      ],
      exports: [
        LogicFunctionExecutorService,
        LogicFunctionBuildService,
        LogicFunctionLayerService,
        CronTriggerCronCommand,
        RouteTriggerService,
      ],
    };
  }
}
