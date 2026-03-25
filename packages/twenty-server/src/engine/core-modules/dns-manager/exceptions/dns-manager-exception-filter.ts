import { Catch, type ExceptionFilter } from '@nestjs/common';

import { assertUnreachable } from 'twenty-shared/utils';

import {
  DnsManagerException,
  DnsManagerExceptionCode,
} from 'src/engine/core-modules/dns-manager/exceptions/dns-manager.exception';

@Catch(DnsManagerException)
export class DnsManagerExceptionFilter implements ExceptionFilter {
  catch(exception: DnsManagerException) {
    switch (exception.code) {
      case DnsManagerExceptionCode.INTERNAL_SERVER_ERROR:
      case DnsManagerExceptionCode.HOSTNAME_ALREADY_REGISTERED:
      case DnsManagerExceptionCode.HOSTNAME_NOT_REGISTERED:
      case DnsManagerExceptionCode.INVALID_INPUT_DATA:
      case DnsManagerExceptionCode.CLOUDFLARE_CLIENT_NOT_INITIALIZED:
      case DnsManagerExceptionCode.MULTIPLE_HOSTNAMES_FOUND:
      case DnsManagerExceptionCode.MISSING_PUBLIC_DOMAIN_URL:
        throw exception;
      default: {
        assertUnreachable(exception.code);
      }
    }
  }
}
