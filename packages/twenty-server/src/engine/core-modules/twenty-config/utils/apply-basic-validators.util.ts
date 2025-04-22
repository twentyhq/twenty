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

// TODO: Add support for custom validators
// Not sure about tailored custom validators for single variables
// Maybe just a single validate method in the decorator that accepts a list of validators
// and applies them to the variable
// also not sure about the file placement/naming -- should this be a util or a service? factory?

export function applyBasicValidators(
  type: ConfigVariableType,
  target: object,
  propertyKey: string,
  options?: ConfigVariableOptions,
): void {
  switch (type) {
    case 'boolean':
      IsBoolean()(target, propertyKey);
      Transform(({ value }) => configTransformers.boolean(value))(
        target,
        propertyKey,
      );
      break;
    case 'number':
      IsNumber()(target, propertyKey);
      Transform(({ value }) => configTransformers.number(value))(
        target,
        propertyKey,
      );
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
