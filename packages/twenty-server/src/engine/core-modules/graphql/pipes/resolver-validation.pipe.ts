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
    const errors = await validate(object);

    if (errors.length === 0) {
      return object;
    }

    const errorMessage = this.formatErrorMessage(errors);

    throw new UserInputError(errorMessage);
  }

  // oxlint-disable-next-line @typescripttypescript/no-explicit-any
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
