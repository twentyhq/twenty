import { Injectable } from '@nestjs/common';

import { type CodeInterpreterDriver } from 'src/engine/core-modules/code-interpreter/drivers/interfaces/code-interpreter-driver.interface';

import { CodeInterpreterDriverType } from 'src/engine/core-modules/code-interpreter/code-interpreter.interface';
import { DisabledDriver } from 'src/engine/core-modules/code-interpreter/drivers/disabled.driver';
import { E2BDriver } from 'src/engine/core-modules/code-interpreter/drivers/e2b.driver';
import { LocalDriver } from 'src/engine/core-modules/code-interpreter/drivers/local.driver';
import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';
import { DriverFactoryBase } from 'src/engine/core-modules/twenty-config/dynamic-factory.base';
import { ConfigVariablesGroup } from 'src/engine/core-modules/twenty-config/enums/config-variables-group.enum';
import { ConfigGroupHashService } from 'src/engine/core-modules/twenty-config/services/config-group-hash.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class CodeInterpreterDriverFactory extends DriverFactoryBase<CodeInterpreterDriver> {
  constructor(
    twentyConfigService: TwentyConfigService,
    configGroupHashService: ConfigGroupHashService,
  ) {
    super(twentyConfigService, configGroupHashService);
  }

  protected buildConfigKey(): string {
    const driverType = this.twentyConfigService.get('CODE_INTERPRETER_TYPE');

    if (driverType === CodeInterpreterDriverType.E_2_B) {
      return `e2b|${this.configGroupHashService.computeHash(ConfigVariablesGroup.CODE_INTERPRETER_CONFIG)}`;
    }

    return driverType;
  }

  protected createDriver(): CodeInterpreterDriver {
    const driverType = this.twentyConfigService.get('CODE_INTERPRETER_TYPE');
    const timeoutMs = this.twentyConfigService.get(
      'CODE_INTERPRETER_TIMEOUT_MS',
    );

    switch (driverType) {
      case CodeInterpreterDriverType.DISABLED:
        return new DisabledDriver(
          'Code interpreter is disabled. Set CODE_INTERPRETER_TYPE to LOCAL (development only) or E2B to enable it.',
        );

      case CodeInterpreterDriverType.LOCAL: {
        const nodeEnv = this.twentyConfigService.get('NODE_ENV');

        if (nodeEnv === NodeEnvironment.PRODUCTION) {
          return new DisabledDriver(
            'LOCAL code interpreter driver is not allowed in production. Use E2B driver instead by setting CODE_INTERPRETER_TYPE=E2B and providing E2B_API_KEY.',
          );
        }

        return new LocalDriver({ timeoutMs });
      }

      case CodeInterpreterDriverType.E_2_B: {
        const apiKey = this.twentyConfigService.get('E2B_API_KEY');

        if (!apiKey) {
          throw new Error(
            'E2B_API_KEY is required when CODE_INTERPRETER_TYPE is E2B',
          );
        }

        return new E2BDriver({ apiKey, timeoutMs });
      }

      default:
        throw new Error(
          `Invalid code interpreter driver type (${driverType}), check your .env file`,
        );
    }
  }
}
