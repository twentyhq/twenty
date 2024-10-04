import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { validate } from 'src/engine/core-modules/environment/environment-variables';
import { ConfigurableModuleClass } from 'src/engine/core-modules/environment/environment.module-definition';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      expandVariables: true,
      validate,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
    }),
  ],
  providers: [EnvironmentService],
  exports: [EnvironmentService],
})
export class EnvironmentModule extends ConfigurableModuleClass {}
