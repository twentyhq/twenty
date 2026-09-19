import { isString } from '@sniptt/guards';
import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
} from 'class-validator';
import { isIP } from 'node:net';

// Multi-workspace routing resolves workspaces from subdomains, which an IP
// address cannot carry, so the frontend ends up in a reload loop.
export const IsValidServerUrlForMultiWorkspace =
  (validationOptions?: ValidationOptions) =>
  (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isValidServerUrlForMultiWorkspace',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          const { IS_MULTIWORKSPACE_ENABLED } = args.object as {
            IS_MULTIWORKSPACE_ENABLED?: boolean | string;
          };

          // Raw env values reach validation as strings, not booleans
          if (String(IS_MULTIWORKSPACE_ENABLED) !== 'true') {
            return true;
          }

          if (!isString(value)) {
            return false;
          }

          try {
            const hostname = new URL(value).hostname.replace(/^\[|\]$/g, '');

            return isIP(hostname) === 0;
          } catch {
            return false;
          }
        },
        defaultMessage() {
          return 'SERVER_URL must use a domain name, not an IP address, when IS_MULTIWORKSPACE_ENABLED is true';
        },
      },
    });
  };
