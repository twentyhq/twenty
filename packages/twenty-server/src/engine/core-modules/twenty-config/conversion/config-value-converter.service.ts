import { Inject, Injectable } from '@nestjs/common';

import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { CONFIG_VARIABLES_INSTANCE_TOKEN } from 'src/engine/core-modules/twenty-config/constants/config-variables-instance-tokens.constants';
import { type ConfigVariablesMetadataMap } from 'src/engine/core-modules/twenty-config/decorators/config-variables-metadata.decorator';
import { ConfigVariableType } from 'src/engine/core-modules/twenty-config/enums/config-variable-type.enum';
import {
  ConfigVariableException,
  ConfigVariableExceptionCode,
} from 'src/engine/core-modules/twenty-config/twenty-config.exception';
import { typeTransformers } from 'src/engine/core-modules/twenty-config/utils/type-transformers.registry';
import { TypedReflect } from 'src/utils/typed-reflect';

@Injectable()
export class ConfigValueConverterService {
  constructor(
    @Inject(CONFIG_VARIABLES_INSTANCE_TOKEN)
    private readonly configVariables: ConfigVariables,
  ) {}

  convertDbValueToAppValue<T extends keyof ConfigVariables>(
    dbValue: unknown,
    key: T,
  ): ConfigVariables[T] | undefined {
    if (dbValue === null || dbValue === undefined) {
      return undefined;
    }

    const metadata = this.getConfigVariableMetadata(key);
    const configType = metadata?.type || this.inferTypeFromValue(key);
    const options = metadata?.options;

    try {
      const transformer = typeTransformers[configType];

      if (!transformer) {
        return dbValue as ConfigVariables[T];
      }

      return transformer.toApp(dbValue, options) as ConfigVariables[T];
    } catch (error) {
      throw new ConfigVariableException(
        `Failed to convert ${key as string} to app value: ${(error as Error).message}`,
        ConfigVariableExceptionCode.VALIDATION_FAILED,
      );
    }
  }

  convertAppValueToDbValue<T extends keyof ConfigVariables>(
    appValue: ConfigVariables[T] | null | undefined,
    key: T,
  ): unknown {
    if (appValue === null || appValue === undefined) {
      return null;
    }

    const metadata = this.getConfigVariableMetadata(key);
    const configType = metadata?.type || this.inferTypeFromValue(key);
    const options = metadata?.options;

    try {
      const transformer = typeTransformers[configType];

      if (!transformer) {
        if (typeof appValue === 'object') {
          try {
            return JSON.parse(JSON.stringify(appValue));
          } catch (error) {
            throw new ConfigVariableException(
              `Failed to serialize object value: ${error instanceof Error ? error.message : String(error)}`,
              ConfigVariableExceptionCode.VALIDATION_FAILED,
            );
          }
        }

        return appValue;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return transformer.toStorage(appValue as any, options);
    } catch (error) {
      if (error instanceof ConfigVariableException) {
        throw error;
      }

      throw new ConfigVariableException(
        `Failed to convert ${key as string} to DB value: ${(error as Error).message}`,
        ConfigVariableExceptionCode.VALIDATION_FAILED,
      );
    }
  }

  private getConfigVariableMetadata<T extends keyof ConfigVariables>(key: T) {
    const allMetadata = TypedReflect.getMetadata(
      'config-variables',
      ConfigVariables.prototype.constructor,
    ) as ConfigVariablesMetadataMap | undefined;

    return allMetadata?.[key as string];
  }

  private inferTypeFromValue<T extends keyof ConfigVariables>(
    key: T,
  ): ConfigVariableType {
    const defaultValue = this.configVariables[key];

    if (typeof defaultValue === 'boolean') return ConfigVariableType.BOOLEAN;
    if (typeof defaultValue === 'number') return ConfigVariableType.NUMBER;
    if (Array.isArray(defaultValue)) return ConfigVariableType.ARRAY;

    return ConfigVariableType.STRING;
  }
}
