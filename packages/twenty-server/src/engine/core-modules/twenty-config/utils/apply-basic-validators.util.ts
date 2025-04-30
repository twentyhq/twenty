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
import { ConfigVariableOptions } from 'src/engine/core-modules/twenty-config/types/config-variable-options.type';
import { configTransformers } from 'src/engine/core-modules/twenty-config/utils/config-transformers.util';

export function applyBasicValidators(
  type: ConfigVariableType,
  target: object,
  propertyKey: string,
  options?: ConfigVariableOptions,
): void {
  switch (type) {
    case ConfigVariableType.BOOLEAN:
      Transform(({ value }) => {
        const result = configTransformers.boolean(value);

        return result !== undefined ? result : value;
      })(target, propertyKey);
      IsBoolean()(target, propertyKey);
      break;

    case ConfigVariableType.NUMBER:
      Transform(({ value }) => {
        const result = configTransformers.number(value);

        return result !== undefined ? result : value;
      })(target, propertyKey);
      IsNumber()(target, propertyKey);
      break;

    case ConfigVariableType.STRING:
      IsString()(target, propertyKey);
      break;

    case ConfigVariableType.ENUM:
      if (options) {
        IsEnum(options)(target, propertyKey);
      }
      break;

    case ConfigVariableType.ARRAY:
      IsArray()(target, propertyKey);
      break;

    default:
      throw new ConfigVariableException(
        `Unsupported config variable type: ${type}`,
        ConfigVariableExceptionCode.UNSUPPORTED_CONFIG_TYPE,
      );
  }
}
