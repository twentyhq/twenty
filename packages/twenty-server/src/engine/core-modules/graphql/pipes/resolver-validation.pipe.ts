import {
  type ArgumentMetadata,
  Injectable,
  type PipeTransform,
  type Type,
} from '@nestjs/common';

import { plainToInstance } from 'class-transformer';
import {
  getMetadataStorage,
  type ValidationError,
  validate,
} from 'class-validator';

import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

// class-validator rescans its global metadata store on every validate() call, so we
// skip the whole plainToInstance + validate roundtrip for argument types that carry no
// validation decorators. Metadata is registered at class load time, so the answer is
// stable per constructor and cached. always=true keeps the lookup conservative: any
// declared constraint (including group-only ones) counts as "has metadata".
const hasValidationMetadataByTarget = new WeakMap<object, boolean>();

const targetHasValidationMetadata = (metatype: Type<unknown>): boolean => {
  const cached = hasValidationMetadataByTarget.get(metatype);

  if (cached !== undefined) {
    return cached;
  }

  const hasMetadata =
    getMetadataStorage().getTargetValidationMetadatas(metatype, '', true, false)
      .length > 0;

  hasValidationMetadataByTarget.set(metatype, hasMetadata);

  return hasMetadata;
};

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

    if (!targetHasValidationMetadata(metatype)) {
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
