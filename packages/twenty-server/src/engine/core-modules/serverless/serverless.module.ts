import { type DynamicModule, Global } from '@nestjs/common';

import { AddPackagesCommand } from 'src/engine/core-modules/serverless/commands/add-packages.command';
import { LambdaDriver } from 'src/engine/core-modules/serverless/drivers/lambda.driver';
import { LocalDriver } from 'src/engine/core-modules/serverless/drivers/local.driver';
import { SERVERLESS_DRIVER } from 'src/engine/core-modules/serverless/serverless.constants';
import {
  ServerlessDriverType,
  type ServerlessModuleAsyncOptions,
} from 'src/engine/core-modules/serverless/serverless.interface';
import { ServerlessService } from 'src/engine/core-modules/serverless/serverless.service';

@Global()
export class ServerlessModule {
  static forRootAsync(options: ServerlessModuleAsyncOptions): DynamicModule {
    const provider = {
      provide: SERVERLESS_DRIVER,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useFactory: async (...args: any[]) => {
        const config = await options.useFactory(...args);

        return config?.type === ServerlessDriverType.LOCAL
          ? new LocalDriver(config.options)
          : new LambdaDriver(config.options);
      },
      inject: options.inject || [],
    };

    return {
      module: ServerlessModule,
      imports: options.imports || [],
      providers: [ServerlessService, provider, AddPackagesCommand],
      exports: [ServerlessService],
    };
  }
}
