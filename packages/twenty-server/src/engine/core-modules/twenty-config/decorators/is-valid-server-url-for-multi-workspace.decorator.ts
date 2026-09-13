import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
} from 'class-validator';
import { isIP } from 'node:net';

export function IsValidServerUrlForMultiWorkspace(
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidServerUrlForMultiWorkspace',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }

          const config = args.object as {
            IS_MULTIWORKSPACE_ENABLED?: boolean;
          };

          if (String(config.IS_MULTIWORKSPACE_ENABLED) !== 'true') {
            return true;
          }

          try {
            const hostname = new URL(value).hostname;

            return isIP(hostname.replace(/^\[|\]$/g, '')) === 0;
          } catch {
            return false;
          }
        },

        defaultMessage() {
          return 'SERVER_URL must use a domain name when IS_MULTIWORKSPACE_ENABLED is enabled.';
        },
      },
    });
  };
}
