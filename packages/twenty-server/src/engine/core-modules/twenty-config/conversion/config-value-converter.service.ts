import { Injectable } from '@nestjs/common';

import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { TypedReflect } from 'src/utils/typed-reflect';

export type ConfigVariableType =
  | 'boolean'
  | 'number'
  | 'array'
  | 'string'
  | 'enum';

@Injectable()
export class ConfigValueConverterService {
  constructor(private readonly configVariables: ConfigVariables) {}

  convertToAppValue<T extends keyof ConfigVariables>(
    dbValue: unknown,
    key: T,
  ): ConfigVariables[T] | undefined {
    if (dbValue === null || dbValue === undefined) {
      return undefined;
    }

    const configType = this.getConfigVarType(key);

    try {
      switch (configType) {
        case 'boolean':
          return this.convertToBoolean(dbValue) as ConfigVariables[T];

        case 'number':
          return this.convertToNumber(
            dbValue,
            key as string,
          ) as ConfigVariables[T];

        case 'array':
          return this.convertToArray(
            dbValue,
            key as string,
          ) as ConfigVariables[T];

        case 'string':
        case 'enum':
        default:
          return dbValue as ConfigVariables[T];
      }
    } catch (error) {
      throw new Error(
        `Failed to convert ${key as string} to app value: ${(error as Error).message}`,
      );
    }
  }

  convertToStorageValue<T extends keyof ConfigVariables>(
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

  private getConfigVarType<T extends keyof ConfigVariables>(
    key: T,
  ): ConfigVariableType {
    const metadataType = TypedReflect.getMetadata(
      'config-variable:type',
      ConfigVariables.prototype.constructor,
      key as string,
    ) as ConfigVariableType | undefined;

    if (metadataType) {
      return metadataType;
    }

    const defaultValue = this.configVariables[key];

    if (typeof defaultValue === 'boolean') return 'boolean';
    if (typeof defaultValue === 'number') return 'number';
    if (Array.isArray(defaultValue)) return 'array';

    return 'string';
  }

  private convertToBoolean(value: unknown): boolean {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'number') {
      return value !== 0;
    }

    if (typeof value === 'string') {
      const lowerValue = value.toLowerCase();

      if (['true', 'on', 'yes', '1'].includes(lowerValue)) {
        return true;
      }

      if (['false', 'off', 'no', '0'].includes(lowerValue)) {
        return false;
      }
    }

    return false;
  }

  private convertToNumber(value: unknown, key: string): number {
    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string') {
      const parsedNumber = parseFloat(value);

      if (isNaN(parsedNumber)) {
        throw new Error(
          `Invalid number value for config variable ${key}: ${value}`,
        );
      }

      return parsedNumber;
    }

    throw new Error(
      `Cannot convert ${typeof value} to number for config variable ${key}`,
    );
  }

  private convertToArray(value: unknown, key: string): unknown[] {
    if (Array.isArray(value)) {
      return value;
    }

    if (typeof value === 'string') {
      try {
        const parsedArray = JSON.parse(value);

        if (Array.isArray(parsedArray)) {
          return parsedArray;
        }
      } catch {
        // JSON parsing failed - normal for comma-separated values
        // TODO: Handle this better
      }

      return value.split(',').map((item) => item.trim());
    }

    throw new Error(
      `Expected array value for config variable ${key}, got ${typeof value}`,
    );
  }
}
