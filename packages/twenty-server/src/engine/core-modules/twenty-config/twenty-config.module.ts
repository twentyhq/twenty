import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { validate } from 'src/engine/core-modules/twenty-config/config-variables';
import { ConfigurableModuleClass } from 'src/engine/core-modules/twenty-config/twenty-config.module-definition';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

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
  providers: [TwentyConfigService],
  exports: [TwentyConfigService],
})
export class TwentyConfigModule extends ConfigurableModuleClass {}
