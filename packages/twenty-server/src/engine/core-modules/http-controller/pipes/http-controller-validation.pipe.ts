import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

import { plainToInstance } from 'class-transformer';
import { ValidationError, validateSync } from 'class-validator';

@Injectable()
export class HttpControllerValidationPipe implements PipeTransform {
  transform(value: unknown, metadata: ArgumentMetadata) {
    const { metatype } = metadata;

    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToInstance(metatype, value, {
      enableImplicitConversion: true,
    });
    const errors = validateSync(object, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      const errorMessages = this.formatErrorMessages(errors);

      throw new BadRequestException(errorMessages);
    }

    return object;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toValidate(metatype: any): boolean {
    const types = [String, Boolean, Number, Array, Object];

    return !types.includes(metatype);
  }

  private formatErrorMessages(errors: ValidationError[]): string[] {
    return errors.flatMap((error) => {
      if (error.constraints) {
        return Object.values(error.constraints);
      }

      return [];
    });
  }
}
