import {
  type ArgumentMetadata,
  Injectable,
  type PipeTransform,
  type Type,
} from '@nestjs/common';

import { plainToInstance } from 'class-transformer';
import { type ValidationError, validate } from 'class-validator';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

@Injectable()
export class ResolverValidationPipe implements PipeTransform {
  async transform(value: unknown, metadata: ArgumentMetadata) {
    const { metatype } = metadata;

    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value);

    let errors: ValidationError[];

    try {
      errors = await validate(object);
    } catch (error) {
      // Fail closed: infrastructure / custom-validator throws must not
      // silently accept the payload (previous behaviour returned []).
      const message =
        error instanceof Error ? error.message : 'Validation failed';

      throw new UserInputError(message);
    }

    if (errors.length === 0) {
      // Return the transformed instance so @Type() / class-transformer
      // mutations apply (Nest ValidationPipe behaviour).
      return object;
    }

    const errorMessage = this.formatErrorMessage(errors);

    throw new UserInputError(errorMessage);
  }

  // oxlint-disable-next-line typescript/no-explicit-any
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
