import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { EnvironmentService } from './environment.service';
import { ConfigurableModuleClass } from './environment.module-definition';
import { validate } from './environment-variables';

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
