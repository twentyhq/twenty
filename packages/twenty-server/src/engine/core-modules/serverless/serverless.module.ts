import { DynamicModule, Global } from '@nestjs/common';

import { LambdaDriver } from 'src/engine/core-modules/serverless/drivers/lambda.driver';
import { LocalDriver } from 'src/engine/core-modules/serverless/drivers/local.driver';
import { SERVERLESS_DRIVER } from 'src/engine/core-modules/serverless/serverless.constants';
import {
  ServerlessDriverType,
  ServerlessModuleAsyncOptions,
} from 'src/engine/core-modules/serverless/serverless.interface';
import { ServerlessService } from 'src/engine/core-modules/serverless/serverless.service';

@Global()
export class ServerlessModule {
  static forRootAsync(options: ServerlessModuleAsyncOptions): DynamicModule {
    const provider = {
      provide: SERVERLESS_DRIVER,
      useFactory: async (...args: any[]) => {
        const config = await options.useFactory(...args);

        return config?.type === ServerlessDriverType.Local
          ? new LocalDriver(config.options)
          : new LambdaDriver(config.options);
      },
      inject: options.inject || [],
    };

    return {
      module: ServerlessModule,
      imports: options.imports || [],
      providers: [ServerlessService, provider],
      exports: [ServerlessService],
    };
  }
}
