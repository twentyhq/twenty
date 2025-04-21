import { Injectable } from '@nestjs/common';

import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { ConfigVariablesMetadataMap } from 'src/engine/core-modules/twenty-config/decorators/config-variables-metadata.decorator';
import { ConfigVariableOptions } from 'src/engine/core-modules/twenty-config/types/config-variable-options.type';
import { ConfigVariableType } from 'src/engine/core-modules/twenty-config/types/config-variable-type.type';
import { configTransformers } from 'src/engine/core-modules/twenty-config/utils/config-transformers.util';
import { TypedReflect } from 'src/utils/typed-reflect';

@Injectable()
export class ConfigValueConverterService {
  constructor(private readonly configVariables: ConfigVariables) {}

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
      switch (configType) {
        case 'boolean':
          return configTransformers.boolean(dbValue) as ConfigVariables[T];

        case 'number':
          return configTransformers.number(dbValue) as ConfigVariables[T];

        case 'string':
          return configTransformers.string(dbValue) as ConfigVariables[T];

        case 'array': {
          const result = this.convertToArray(dbValue, options);

          return result as ConfigVariables[T];
        }

        case 'enum': {
          const result = this.convertToEnum(dbValue, options);

          return result as ConfigVariables[T];
        }

        default:
          return dbValue as ConfigVariables[T];
      }
    } catch (error) {
      throw new Error(
        `Failed to convert ${key as string} to app value: ${(error as Error).message}`,
      );
    }
  }

  convertAppValueToDbValue<T extends keyof ConfigVariables>(
    appValue: ConfigVariables[T],
  ): unknown {
    if (appValue === undefined) {
      return null;
    }

    if (
      typeof appValue === 'string' ||
      typeof appValue === 'number' ||
      typeof appValue === 'boolean' ||
      appValue === null
    ) {
      return appValue;
    }

    if (Array.isArray(appValue)) {
      return appValue;
    }

    if (typeof appValue === 'object') {
      return JSON.parse(JSON.stringify(appValue));
    }

    throw new Error(
      `Cannot convert value of type ${typeof appValue} to storage format`,
    );
  }

  private convertToArray(
    value: unknown,
    options?: ConfigVariableOptions,
  ): unknown[] {
    if (Array.isArray(value)) {
      return this.validateArrayAgainstOptions(value, options);
    }

    if (typeof value === 'string') {
      try {
        const parsedArray = JSON.parse(value);

        if (Array.isArray(parsedArray)) {
          return this.validateArrayAgainstOptions(parsedArray, options);
        }
      } catch {
        const splitArray = value.split(',').map((item) => item.trim());

        return this.validateArrayAgainstOptions(splitArray, options);
      }
    }

    return [];
  }

  private validateArrayAgainstOptions(
    array: unknown[],
    options?: ConfigVariableOptions,
  ): unknown[] {
    if (!options || !Array.isArray(options) || options.length === 0) {
      return array;
    }

    return array.filter((item) => options.includes(item as any));
  }

  private convertToEnum(
    value: unknown,
    options?: ConfigVariableOptions,
  ): unknown {
    if (!options || !Array.isArray(options) || options.length === 0) {
      return value;
    }

    if (options.includes(value as any)) {
      return value;
    }

    return undefined;
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

    if (typeof defaultValue === 'boolean') return 'boolean';
    if (typeof defaultValue === 'number') return 'number';
    if (Array.isArray(defaultValue)) return 'array';

    return 'string';
  }
}
