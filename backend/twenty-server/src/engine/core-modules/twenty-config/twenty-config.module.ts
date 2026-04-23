import { type DynamicModule, Global, Module } from '@nestjs/common';

import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { CONFIG_VARIABLES_INSTANCE_TOKEN } from 'src/engine/core-modules/twenty-config/constants/config-variables-instance-tokens.constants';
import { DatabaseConfigModule } from 'src/engine/core-modules/twenty-config/drivers/database-config.module';
import { ConfigurableModuleClass } from 'src/engine/core-modules/twenty-config/twenty-config.module-definition';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { ConfigVariableVersionService } from 'src/engine/core-modules/twenty-config/versioning/config-variable-version.service';

@Global()
@Module({})
export class TwentyConfigModule extends ConfigurableModuleClass {
  static forRoot(): DynamicModule {
    const isConfigVariablesInDbEnabled =
      process.env.IS_CONFIG_VARIABLES_IN_DB_ENABLED !== 'false';

    const imports = isConfigVariablesInDbEnabled
      ? [DatabaseConfigModule.forRoot()]
      : [];
    const exports = isConfigVariablesInDbEnabled
      ? [TwentyConfigService, ConfigVariableVersionService]
      : [TwentyConfigService];

    return {
      module: TwentyConfigModule,
      imports,
      providers: [
        TwentyConfigService,
        {
          provide: CONFIG_VARIABLES_INSTANCE_TOKEN,
          useValue: new ConfigVariables(),
        },
      ],
      exports,
    };
  }
}
