import { isNonEmptyString, isString } from '@sniptt/guards';
import {
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
} from 'class-validator';
import { isIP } from 'node:net';

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
          const { IS_MULTIWORKSPACE_ENABLED, FRONTEND_URL } = args.object as {
            IS_MULTIWORKSPACE_ENABLED?: boolean | string;
            FRONTEND_URL?: string;
          };

          if (String(IS_MULTIWORKSPACE_ENABLED) !== 'true') {
            return true;
          }

          const workspaceBaseUrl = isNonEmptyString(FRONTEND_URL)
            ? FRONTEND_URL
            : value;

          if (!isString(workspaceBaseUrl)) {
            return false;
          }

          try {
            const hostname = new URL(workspaceBaseUrl).hostname.replace(
              /^\[|\]$/g,
              '',
            );

            return isIP(hostname) === 0;
          } catch {
            return false;
          }
        },
        defaultMessage() {
          return 'FRONTEND_URL, or SERVER_URL when FRONTEND_URL is not set, must use a domain name, not an IP address, when IS_MULTIWORKSPACE_ENABLED is true';
        },
      },
    });
  };
