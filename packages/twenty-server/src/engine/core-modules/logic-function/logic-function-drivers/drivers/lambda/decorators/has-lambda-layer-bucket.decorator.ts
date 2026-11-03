import { isNonEmptyString } from '@sniptt/guards';
import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';

import { LogicFunctionDriverType } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import { type ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';

@ValidatorConstraint({ async: false })
export class HasLambdaLayerBucketConstraint implements ValidatorConstraintInterface {
  validate(logicFunctionType: unknown, { object }: ValidationArguments) {
    const { LOGIC_FUNCTION_LAMBDA_LAYER_BUCKET, STORAGE_S3_NAME } =
      object as Pick<
        ConfigVariables,
        'LOGIC_FUNCTION_LAMBDA_LAYER_BUCKET' | 'STORAGE_S3_NAME'
      >;

    return (
      logicFunctionType !== LogicFunctionDriverType.LAMBDA ||
      isNonEmptyString(LOGIC_FUNCTION_LAMBDA_LAYER_BUCKET ?? STORAGE_S3_NAME)
    );
  }

  defaultMessage() {
    return 'LOGIC_FUNCTION_LAMBDA_LAYER_BUCKET or STORAGE_S3_NAME must be set when LOGIC_FUNCTION_TYPE is LAMBDA';
  }
}

export const HasLambdaLayerBucket =
  (validationOptions?: ValidationOptions) =>
  (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: HasLambdaLayerBucketConstraint,
    });
  };
