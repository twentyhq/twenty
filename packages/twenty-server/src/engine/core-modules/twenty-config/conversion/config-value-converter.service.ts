import { Inject, Injectable, Logger } from '@nestjs/common';

import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { CONFIG_VARIABLES_INSTANCE_TOKEN } from 'src/engine/core-modules/twenty-config/constants/config-variables-instance-tokens.constants';
import { ConfigVariablesMetadataMap } from 'src/engine/core-modules/twenty-config/decorators/config-variables-metadata.decorator';
import { ConfigVariableType } from 'src/engine/core-modules/twenty-config/enums/config-variable-type.enum';
import {
  ConfigVariableException,
  ConfigVariableExceptionCode,
} from 'src/engine/core-modules/twenty-config/twenty-config.exception';
import { ConfigVariableOptions } from 'src/engine/core-modules/twenty-config/types/config-variable-options.type';
import { configTransformers } from 'src/engine/core-modules/twenty-config/utils/config-transformers.util';
import { TypedReflect } from 'src/utils/typed-reflect';

@Injectable()
export class ConfigValueConverterService {
  private readonly logger = new Logger(ConfigValueConverterService.name);

  constructor(
    @Inject(CONFIG_VARIABLES_INSTANCE_TOKEN)
    private readonly configVariables: ConfigVariables,
  ) {}

  /**
   * Transforms and validates an input value to the correct type for a config variable
   * This is used when receiving values from frontend/API and ensures proper type conversion
   * @param inputValue The input value (often a string from frontend)
   * @param key The config variable key
   * @returns The properly typed value if valid
   * @throws ConfigVariableException if the value cannot be converted to the required type
   */
  transformAndValidateInputValue<T extends keyof ConfigVariables>(
    inputValue: any,
    key: T,
  ): ConfigVariables[T] {
    const metadata = this.getConfigVariableMetadata(key);
    const configType = metadata?.type;
    const options = metadata?.options;

    let convertedValue: any;

    try {
      switch (configType) {
        case ConfigVariableType.BOOLEAN: {
          convertedValue = configTransformers.boolean(inputValue);

          if (convertedValue === undefined) {
            throw new Error(`Cannot convert value to boolean`);
          }
          break;
        }

        case ConfigVariableType.NUMBER: {
          convertedValue = configTransformers.number(inputValue);

          if (convertedValue === undefined) {
            throw new Error(`Cannot convert value to number`);
          }

          break;
        }

        case ConfigVariableType.STRING: {
          convertedValue = configTransformers.string(inputValue);

          if (convertedValue === undefined) {
            throw new Error(`Cannot convert value to string`);
          }
          break;
        }

        case ConfigVariableType.ARRAY: {
          convertedValue = this.convertToArray(inputValue, options);

          if (convertedValue === undefined || !Array.isArray(convertedValue)) {
            throw new Error(`Cannot convert value to array`);
          }
          break;
        }

        case ConfigVariableType.ENUM: {
          convertedValue = this.convertToEnum(inputValue, options);

          if (convertedValue === undefined) {
            throw new Error(
              `Value must be one of [${Array.isArray(options) ? options.join(', ') : ''}]`,
            );
          }
          break;
        }

        default:
          convertedValue = inputValue;
      }

      return convertedValue as ConfigVariables[T];
    } catch (error) {
      throw new ConfigVariableException(
        `Type validation failed for ${key as string}: ${(error as Error).message}`,
        ConfigVariableExceptionCode.TYPE_VALIDATION_FAILED,
      );
    }
  }

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
        case ConfigVariableType.BOOLEAN: {
          const result = configTransformers.boolean(dbValue);

          if (result !== undefined && typeof result !== 'boolean') {
            throw new Error(
              `Expected boolean for key ${key}, got ${typeof result}`,
            );
          }

          return result as ConfigVariables[T];
        }

        case ConfigVariableType.NUMBER: {
          const result = configTransformers.number(dbValue);

          if (result !== undefined && typeof result !== 'number') {
            throw new Error(
              `Expected number for key ${key}, got ${typeof result}`,
            );
          }

          return result as ConfigVariables[T];
        }

        case ConfigVariableType.STRING: {
          const result = configTransformers.string(dbValue);

          if (result !== undefined && typeof result !== 'string') {
            throw new Error(
              `Expected string for key ${key}, got ${typeof result}`,
            );
          }

          return result as ConfigVariables[T];
        }

        case ConfigVariableType.ARRAY: {
          const result = this.convertToArray(dbValue, options);

          if (result !== undefined && !Array.isArray(result)) {
            throw new Error(
              `Expected array for key ${key}, got ${typeof result}`,
            );
          }

          return result as ConfigVariables[T];
        }

        case ConfigVariableType.ENUM: {
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
    if (!options) {
      return value;
    }

    // Convert value to string for comparison
    const stringValue = String(value);

    // Check if options is an array
    if (Array.isArray(options)) {
      // Use standard for loop to avoid TypeScript issues with includes
      for (let i = 0; i < options.length; i++) {
        if (String(options[i]) === stringValue) {
          return value;
        }
      }
    }
    // Check if options is a record
    else if (typeof options === 'object') {
      for (const key in options) {
        if (key === stringValue || options[key] === stringValue) {
          return value;
        }
      }
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

    if (typeof defaultValue === 'boolean') return ConfigVariableType.BOOLEAN;
    if (typeof defaultValue === 'number') return ConfigVariableType.NUMBER;
    if (Array.isArray(defaultValue)) return ConfigVariableType.ARRAY;

    return ConfigVariableType.STRING;
  }
}
