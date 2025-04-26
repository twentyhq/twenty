import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsString,
} from 'class-validator';

import { ConfigVariableOptions } from 'src/engine/core-modules/twenty-config/types/config-variable-options.type';
import { ConfigVariableType } from 'src/engine/core-modules/twenty-config/types/config-variable-type.type';
import { configTransformers } from 'src/engine/core-modules/twenty-config/utils/config-transformers.util';

export function applyBasicValidators(
  type: ConfigVariableType,
  target: object,
  propertyKey: string,
  options?: ConfigVariableOptions,
): void {
  switch (type) {
    case 'boolean':
      Transform(({ value }) => {
        const result = configTransformers.boolean(value);

        return result !== undefined ? result : value;
      })(target, propertyKey);
      IsBoolean()(target, propertyKey);
      break;

    case 'number':
      Transform(({ value }) => {
        const result = configTransformers.number(value);

        return result !== undefined ? result : value;
      })(target, propertyKey);
      IsNumber()(target, propertyKey);
      break;

    case 'string':
      IsString()(target, propertyKey);
      break;

    case 'enum':
      if (options && Array.isArray(options)) {
        IsEnum(options)(target, propertyKey);
      }
      break;

    case 'array':
      IsArray()(target, propertyKey);
      break;

    default:
      throw new Error(`Unsupported config variable type: ${type}`);
  }
}
