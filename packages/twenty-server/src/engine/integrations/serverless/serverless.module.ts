import { DynamicModule, Global } from '@nestjs/common';

import { LambdaDriver } from 'src/engine/integrations/serverless/drivers/lambda.driver';
import { LocalDriver } from 'src/engine/integrations/serverless/drivers/local.driver';
import { BuildDirectoryManagerService } from 'src/engine/integrations/serverless/drivers/services/build-directory-manager.service';
import { SERVERLESS_DRIVER } from 'src/engine/integrations/serverless/serverless.constants';
import {
  ServerlessDriverType,
  ServerlessModuleAsyncOptions,
} from 'src/engine/integrations/serverless/serverless.interface';
import { ServerlessService } from 'src/engine/integrations/serverless/serverless.service';

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
      providers: [ServerlessService, BuildDirectoryManagerService, provider],
      exports: [ServerlessService],
    };
  }
}
