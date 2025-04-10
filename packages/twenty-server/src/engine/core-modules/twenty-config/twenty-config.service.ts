import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { CONFIG_VARIABLES_MASKING_CONFIG } from 'src/engine/core-modules/twenty-config/constants/config-variables-masking-config';
import { ConfigVariablesMetadataOptions } from 'src/engine/core-modules/twenty-config/decorators/config-variables-metadata.decorator';
import { ConfigVariablesMaskingStrategies } from 'src/engine/core-modules/twenty-config/enums/config-variables-masking-strategies.enum';
import { configVariableMaskSensitiveData } from 'src/engine/core-modules/twenty-config/utils/config-variable-mask-sensitive-data.util';
import { TypedReflect } from 'src/utils/typed-reflect';

@Injectable()
export class TwentyConfigService {
  constructor(private readonly configService: ConfigService) {}

  get<T extends keyof ConfigVariables>(key: T): ConfigVariables[T] {
    return this.configService.get<ConfigVariables[T]>(
      key,
      new ConfigVariables()[key],
    );
  }

  getAll(): Record<
    string,
    {
      value: ConfigVariables[keyof ConfigVariables];
      metadata: ConfigVariablesMetadataOptions;
    }
  > {
    const result: Record<
      string,
      {
        value: ConfigVariables[keyof ConfigVariables];
        metadata: ConfigVariablesMetadataOptions;
      }
    > = {};

    const configVars = new ConfigVariables();
    const metadata =
      TypedReflect.getMetadata('config-variables', ConfigVariables) ?? {};

    Object.entries(metadata).forEach(([key, envMetadata]) => {
      let value =
        this.configService.get(key) ??
        configVars[key as keyof ConfigVariables] ??
        '';

      if (typeof value === 'string' && key in CONFIG_VARIABLES_MASKING_CONFIG) {
        const varMaskingConfig =
          CONFIG_VARIABLES_MASKING_CONFIG[
            key as keyof typeof CONFIG_VARIABLES_MASKING_CONFIG
          ];
        const options =
          varMaskingConfig.strategy ===
          ConfigVariablesMaskingStrategies.LAST_N_CHARS
            ? { chars: varMaskingConfig.chars }
            : undefined;

        value = configVariableMaskSensitiveData(
          value,
          varMaskingConfig.strategy,
          { ...options, variableName: key },
        );
      }

      result[key] = {
        value,
        metadata: envMetadata,
      };
    });

    return result;
  }
}
