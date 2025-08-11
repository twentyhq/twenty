import {
  type ArgumentMetadata,
  Injectable,
  type PipeTransform,
  type Type,
} from '@nestjs/common';

import { plainToInstance } from 'class-transformer';
import { type ValidationError, validate } from 'class-validator';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

const safeClassValidatorValidateWrapper = async (
  object: object,
): Promise<ValidationError[]> => {
  try {
    return await validate(object);
  } catch {
    return [];
  }
};

@Injectable()
export class ResolverValidationPipe implements PipeTransform {
  async transform(value: unknown, metadata: ArgumentMetadata) {
    const { metatype } = metadata;

    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);
    const errors = await safeClassValidatorValidateWrapper(object);

    if (errors.length === 0) {
      // TODO shouldn't we return the object here ? As transpilation could bring mutations
      return value;
    }

    const errorMessage = this.formatErrorMessage(errors);

    throw new UserInputError(errorMessage);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toValidate(metatype: Type<any>): boolean {
    const types: unknown[] = [String, Boolean, Number, Array, Object];

    return !types.includes(metatype);
  }

  private formatErrorMessage(errors: ValidationError[]): string {
    const messages = errors.flatMap((error) => {
      if (error.constraints) {
        return Object.values(error.constraints);
      }

      if (error.children) {
        return this.formatErrorMessage(error.children);
      }

      return [];
    });

    return messages.join(', ');
  }
}
