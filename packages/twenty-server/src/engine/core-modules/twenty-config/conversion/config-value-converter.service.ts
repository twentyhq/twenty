import { Injectable, Logger } from '@nestjs/common';

import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { ConfigVariablesMetadataMap } from 'src/engine/core-modules/twenty-config/decorators/config-variables-metadata.decorator';
import { ConfigVariableOptions } from 'src/engine/core-modules/twenty-config/types/config-variable-options.type';
import { ConfigVariableType } from 'src/engine/core-modules/twenty-config/types/config-variable-type.type';
import { configTransformers } from 'src/engine/core-modules/twenty-config/utils/config-transformers.util';
import { TypedReflect } from 'src/utils/typed-reflect';

@Injectable()
export class ConfigValueConverterService {
  private readonly logger = new Logger(ConfigValueConverterService.name);

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
        case 'boolean': {
          const result = configTransformers.boolean(dbValue);

          if (result === undefined) {
            throw new Error(
              `Value '${String(dbValue)}' cannot be converted to boolean`,
            );
          }

          return result as ConfigVariables[T];
        }

        case 'number': {
          const result = configTransformers.number(dbValue);

          if (result === undefined) {
            throw new Error(
              `Value '${String(dbValue)}' cannot be converted to number`,
            );
          }

          return result as ConfigVariables[T];
        }

        case 'string': {
          const result = configTransformers.string(dbValue);

          if (result === undefined) {
            throw new Error(`Value cannot be converted to string`);
          }

          return result as ConfigVariables[T];
        }

        case 'array': {
          const result = this.convertToArray(dbValue, options);

          return result as ConfigVariables[T];
        }

        case 'enum': {
          const result = this.convertToEnum(dbValue, options);

          if (result === undefined) {
            this.logger.warn(
              `Enum value '${String(dbValue)}' not found in options for key ${String(key)}`,
            );
          }

          return result as ConfigVariables[T];
        }

        default:
          this.logger.warn(
            `No specific conversion for type '${configType}' of key '${String(key)}'`,
          );

          return dbValue as ConfigVariables[T];
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      throw new Error(
        `Failed to convert value for key '${String(key)}': ${errorMessage}`,
      );
    }
  }

  convertAppValueToDbValue<T extends keyof ConfigVariables>(
    appValue: ConfigVariables[T] | null | undefined,
  ): unknown {
    if (appValue === undefined || appValue === null) {
      return null;
    }

    if (
      typeof appValue === 'string' ||
      typeof appValue === 'number' ||
      typeof appValue === 'boolean'
    ) {
      return appValue;
    }

    if (Array.isArray(appValue)) {
      return appValue;
    }

    if (typeof appValue === 'object') {
      try {
        return JSON.parse(JSON.stringify(appValue));
      } catch (error) {
        throw new Error(
          `Failed to serialize object value: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
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

    return this.validateArrayAgainstOptions([value], options);
  }

  private validateArrayAgainstOptions(
    array: unknown[],
    options?: ConfigVariableOptions,
  ): unknown[] {
    if (!options || !Array.isArray(options) || options.length === 0) {
      return array;
    }

    return array.filter((item) => {
      const included = options.includes(item as string);

      if (!included) {
        this.logger.debug(
          `Filtered out array item '${String(item)}' not in allowed options`,
        );
      }

      return included;
    });
  }

  private convertToEnum(
    value: unknown,
    options?: ConfigVariableOptions,
  ): unknown | undefined {
    if (!options || !Array.isArray(options) || options.length === 0) {
      return value;
    }

    if (options.includes(value as string)) {
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
