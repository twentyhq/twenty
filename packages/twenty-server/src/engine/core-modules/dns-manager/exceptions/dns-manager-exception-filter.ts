import { Catch, type ExceptionFilter } from '@nestjs/common';

import { assertUnreachable } from 'twenty-shared/utils';

import {
  DnsManagerException,
  DnsManagerExceptionCode,
} from 'src/engine/core-modules/dns-manager/exceptions/dns-manager.exception';
import {
  BaseGraphQLError,
  ConflictError,
  NotFoundError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

@Catch(DnsManagerException)
export class DnsManagerExceptionFilter implements ExceptionFilter {
  catch(exception: DnsManagerException) {
    switch (exception.code) {
      case DnsManagerExceptionCode.HOSTNAME_NOT_REGISTERED:
      case DnsManagerExceptionCode.MISSING_PUBLIC_DOMAIN_URL:
        throw new NotFoundError(exception);
      case DnsManagerExceptionCode.HOSTNAME_ALREADY_REGISTERED:
        throw new ConflictError(exception);
      case DnsManagerExceptionCode.INVALID_INPUT_DATA:
      case DnsManagerExceptionCode.CLOUDFLARE_CLIENT_NOT_INITIALIZED:
      case DnsManagerExceptionCode.MULTIPLE_HOSTNAMES_FOUND:
      case DnsManagerExceptionCode.INTERNAL_SERVER_ERROR:
        throw new BaseGraphQLError(exception);
      default: {
        assertUnreachable(exception.code);
      }
    }
  }
}
