import {
  registerDecorator,
  type ValidationOptions,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
  isURL,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsRedisUrlConstraint implements ValidatorConstraintInterface {
  validate(value: any) {
    if (typeof value !== 'string' || !value.trim()) {
      return false;
    }

    // Support unix domain socket paths e.g. unix:///var/run/redis/redis.sock or /var/run/redis/redis.sock
    if (value.startsWith('unix://') || value.startsWith('/')) {
      const pathWithoutScheme = value.replace(/^unix:\/\//, '');
      const pathOnly = pathWithoutScheme.split('?')[0];

      return pathOnly.length > 1;
    }

    // Support standard redis:// and rediss:// URLs
    return isURL(value, {
      protocols: ['redis', 'rediss'],
      require_tld: false,
      allow_underscores: true,
    });
  }

  defaultMessage() {
    return '$property must be a valid Redis URL (redis://, rediss://) or Unix socket URL (unix:///)';
  }
}

export const IsRedisUrl =
  (validationOptions?: ValidationOptions) =>
  (object: object, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsRedisUrlConstraint,
    });
  };
