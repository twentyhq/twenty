import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { EnvironmentService } from 'packages/twenty-server/src/engine/core-modules/environment/environment.service';
import { ConfigurableModuleClass } from 'packages/twenty-server/src/engine/core-modules/environment/environment.module-definition';
import { validate } from 'packages/twenty-server/src/engine/core-modules/environment/environment-variables';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      validate,
    }),
  ],
  providers: [EnvironmentService],
  exports: [EnvironmentService],
})
export class EnvironmentModule extends ConfigurableModuleClass {}
