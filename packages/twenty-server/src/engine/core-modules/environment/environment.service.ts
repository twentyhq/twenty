/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ENVIRONMENT_VARIABLES_MASKING_CONFIG } from 'src/engine/core-modules/environment/constants/environment-variables-masking-config';
import { ENVIRONMENT_VARIABLES_METADATA_DECORATOR_KEY } from 'src/engine/core-modules/environment/constants/environment-variables-metadata-decorator-key';
import { ENVIRONMENT_VARIABLES_METADATA_DECORATOR_NAMES_KEY } from 'src/engine/core-modules/environment/constants/environment-variables-metadata-decorator-names-key';
import { EnvironmentVariablesMetadataOptions } from 'src/engine/core-modules/environment/decorators/environment-variables-metadata.decorator';
import { EnvironmentVariablesMaskingStrategies } from 'src/engine/core-modules/environment/enums/environment-variables-masking-strategies.enum';
import { EnvironmentVariables } from 'src/engine/core-modules/environment/environment-variables';
import { environmentVariableMaskSensitiveData } from 'src/engine/core-modules/environment/utils/environment-variable-mask-sensitive-data.util';

@Injectable()
export class EnvironmentService {
  constructor(private readonly configService: ConfigService) {}

  get<T extends keyof EnvironmentVariables>(key: T): EnvironmentVariables[T] {
    return this.configService.get<EnvironmentVariables[T]>(
      key,
      new EnvironmentVariables()[key],
    );
  }

  getAll(): Record<
    string,
    {
      value: EnvironmentVariables[keyof EnvironmentVariables];
      metadata: EnvironmentVariablesMetadataOptions;
    }
  > {
    const result: Record<
      string,
      {
        value: EnvironmentVariables[keyof EnvironmentVariables];
        metadata: EnvironmentVariablesMetadataOptions;
      }
    > = {};

    const envVars = new EnvironmentVariables();

    const allEnvVarNames =
      Reflect.getMetadata(
        ENVIRONMENT_VARIABLES_METADATA_DECORATOR_NAMES_KEY,
        EnvironmentVariables,
      ) || [];

    allEnvVarNames.forEach((key: string) => {
      const metadata = Reflect.getMetadata(
        ENVIRONMENT_VARIABLES_METADATA_DECORATOR_KEY,
        EnvironmentVariables.prototype,
        key,
      );

      if (metadata) {
        let value =
          this.configService.get(key) ??
          envVars[key as keyof EnvironmentVariables] ??
          '';

        if (
          typeof value === 'string' &&
          key in ENVIRONMENT_VARIABLES_MASKING_CONFIG
        ) {
          const varMaskingConfig =
            ENVIRONMENT_VARIABLES_MASKING_CONFIG[
              key as keyof typeof ENVIRONMENT_VARIABLES_MASKING_CONFIG
            ];
          const options =
            varMaskingConfig.strategy ===
            EnvironmentVariablesMaskingStrategies.LAST_N_CHARS
              ? { chars: varMaskingConfig.chars }
              : undefined;

          value = environmentVariableMaskSensitiveData(
            value,
            varMaskingConfig.strategy,
            options,
          );
        }

        result[key] = {
          value,
          metadata,
        };
      }
    });

    return result;
  }
}
