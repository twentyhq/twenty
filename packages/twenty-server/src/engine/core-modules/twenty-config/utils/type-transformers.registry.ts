import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsString,
} from 'class-validator';

import { ConfigVariableType } from 'src/engine/core-modules/twenty-config/enums/config-variable-type.enum';
import {
  ConfigVariableException,
  ConfigVariableExceptionCode,
} from 'src/engine/core-modules/twenty-config/twenty-config.exception';
import { type ConfigVariableOptions } from 'src/engine/core-modules/twenty-config/types/config-variable-options.type';
import { configTransformers } from 'src/engine/core-modules/twenty-config/utils/config-transformers.util';

export interface TypeTransformer<T> {
  toApp: (value: unknown, options?: ConfigVariableOptions) => T | undefined;

  toStorage: (value: T, options?: ConfigVariableOptions) => unknown;

  getValidators: (options?: ConfigVariableOptions) => PropertyDecorator[];

  getTransformers: () => PropertyDecorator[];
}

export const typeTransformers: Record<
  ConfigVariableType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TypeTransformer<any>
> = {
  [ConfigVariableType.BOOLEAN]: {
    toApp: (value: unknown): boolean | undefined => {
      if (value === null || value === undefined) return undefined;

      const result = configTransformers.boolean(value);

      if (result !== undefined && typeof result !== 'boolean') {
        throw new ConfigVariableException(
          `Expected boolean, got ${typeof result}`,
          ConfigVariableExceptionCode.VALIDATION_FAILED,
        );
      }

      return result;
    },

    toStorage: (value: boolean): boolean => {
      if (typeof value !== 'boolean') {
        throw new ConfigVariableException(
          `Expected boolean, got ${typeof value}`,
          ConfigVariableExceptionCode.VALIDATION_FAILED,
        );
      }

      return value;
    },

    getValidators: (): PropertyDecorator[] => [IsBoolean()],

    getTransformers: (): PropertyDecorator[] => [
      Transform(({ value }) => {
        const result = configTransformers.boolean(value);

        return result !== undefined ? result : value;
      }),
    ],
  },

  [ConfigVariableType.NUMBER]: {
    toApp: (value: unknown): number | undefined => {
      if (value === null || value === undefined) return undefined;

      const result = configTransformers.number(value);

      if (result !== undefined && typeof result !== 'number') {
        throw new ConfigVariableException(
          `Expected number, got ${typeof result}`,
          ConfigVariableExceptionCode.VALIDATION_FAILED,
        );
      }

      return result;
    },

    toStorage: (value: number): number => {
      if (typeof value !== 'number') {
        throw new ConfigVariableException(
          `Expected number, got ${typeof value}`,
          ConfigVariableExceptionCode.VALIDATION_FAILED,
        );
      }

      return value;
    },

    getValidators: (): PropertyDecorator[] => [IsNumber()],

    getTransformers: (): PropertyDecorator[] => [
      Transform(({ value }) => {
        const result = configTransformers.number(value);

        return result !== undefined ? result : value;
      }),
    ],
  },

  [ConfigVariableType.STRING]: {
    toApp: (value: unknown): string | undefined => {
      if (value === null || value === undefined) return undefined;

      const result = configTransformers.string(value);

      if (result !== undefined && typeof result !== 'string') {
        throw new ConfigVariableException(
          `Expected string, got ${typeof result}`,
          ConfigVariableExceptionCode.VALIDATION_FAILED,
        );
      }

      return result;
    },

    toStorage: (value: string): string => {
      if (typeof value !== 'string') {
        throw new ConfigVariableException(
          `Expected string, got ${typeof value}`,
          ConfigVariableExceptionCode.VALIDATION_FAILED,
        );
      }

      return value;
    },

    getValidators: (): PropertyDecorator[] => [IsString()],

    getTransformers: (): PropertyDecorator[] => [],
  },

  [ConfigVariableType.ARRAY]: {
    toApp: (
      value: unknown,
      options?: ConfigVariableOptions,
    ): unknown[] | undefined => {
      if (value === null || value === undefined) return undefined;

      let arrayValue: unknown[];

      if (Array.isArray(value)) {
        arrayValue = value;
      } else if (typeof value === 'string') {
        try {
          const parsedArray = JSON.parse(value);

          if (Array.isArray(parsedArray)) {
            arrayValue = parsedArray;
          } else {
            arrayValue = value.split(',').map((item) => item.trim());
          }
        } catch {
          arrayValue = value.split(',').map((item) => item.trim());
        }
      } else {
        arrayValue = [value];
      }

      if (!options || !Array.isArray(options) || options.length === 0) {
        return arrayValue;
      }

      return arrayValue.filter((item) => options.includes(item as string));
    },

    toStorage: (
      value: unknown[],
      options?: ConfigVariableOptions,
    ): unknown[] => {
      if (!Array.isArray(value)) {
        throw new ConfigVariableException(
          `Expected array, got ${typeof value}`,
          ConfigVariableExceptionCode.VALIDATION_FAILED,
        );
      }

      if (!options || !Array.isArray(options) || options.length === 0) {
        return value;
      }

      return value.filter((item) => options.includes(item as string));
    },

    getValidators: (): PropertyDecorator[] => [IsArray()],

    getTransformers: (): PropertyDecorator[] => [],
  },

  [ConfigVariableType.ENUM]: {
    toApp: (
      value: unknown,
      options?: ConfigVariableOptions,
    ): string | undefined => {
      if (value === null || value === undefined) return undefined;

      if (!options || !Array.isArray(options) || options.length === 0) {
        return value as string;
      }

      return options.includes(value as string) ? (value as string) : undefined;
    },

    toStorage: (value: string, options?: ConfigVariableOptions): string => {
      if (typeof value !== 'string') {
        throw new ConfigVariableException(
          `Expected string for enum, got ${typeof value}`,
          ConfigVariableExceptionCode.VALIDATION_FAILED,
        );
      }

      if (!options || !Array.isArray(options) || options.length === 0) {
        return value;
      }

      if (!options.includes(value)) {
        throw new ConfigVariableException(
          `Value '${value}' is not a valid option for enum`,
          ConfigVariableExceptionCode.VALIDATION_FAILED,
        );
      }

      return value;
    },

    getValidators: (options?: ConfigVariableOptions): PropertyDecorator[] => {
      if (!options) {
        return [];
      }

      return [IsEnum(options)];
    },

    getTransformers: (): PropertyDecorator[] => [],
  },
};
