import { isNonEmptyString } from '@sniptt/guards';
import {
  isURL,
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from 'class-validator';
import { isDefined } from 'twenty-shared/utils';

import { REDIS_UNIX_SOCKET_URL_PROTOCOL } from 'src/engine/core-modules/redis-client/constants/redis-unix-socket-url-protocol.constant';
import { parseRedisUnixSocketUrl } from 'src/engine/core-modules/redis-client/utils/parse-redis-unix-socket-url.util';

@ValidatorConstraint({ async: false })
export class IsRedisUrlConstraint implements ValidatorConstraintInterface {
  validate(value: unknown) {
    if (!isNonEmptyString(value)) {
      return false;
    }

    if (value.startsWith(REDIS_UNIX_SOCKET_URL_PROTOCOL)) {
      return isDefined(parseRedisUnixSocketUrl(value));
    }

    return isURL(value, {
      protocols: ['redis', 'rediss'],
      require_tld: false,
      allow_underscores: true,
    });
  }

  defaultMessage({ value }: ValidationArguments) {
    return isNonEmptyString(value) &&
      value.startsWith(REDIS_UNIX_SOCKET_URL_PROTOCOL)
      ? '$property must be unix:///path/to/redis.sock with only percent-encoded db, username and password parameters'
      : '$property must be a redis://, rediss:// or unix:// URL';
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
