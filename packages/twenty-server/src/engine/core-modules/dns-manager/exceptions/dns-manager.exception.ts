import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import {
  appendCommonExceptionCode,
  CustomException,
  type ExceptionCategory,
} from 'src/utils/custom-exception';

export class DnsManagerException extends CustomException<
  keyof typeof DnsManagerExceptionCode
> {
  constructor(
    message: string,
    code: keyof typeof DnsManagerExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? msg`A DNS manager error occurred.`,
      category: DNS_MANAGER_EXCEPTION_CATEGORY_BY_CODE[code],
    });
  }
}

export const DnsManagerExceptionCode = appendCommonExceptionCode({
  HOSTNAME_ALREADY_REGISTERED: 'HOSTNAME_ALREADY_REGISTERED',
  HOSTNAME_NOT_REGISTERED: 'HOSTNAME_NOT_REGISTERED',
  INVALID_INPUT_DATA: 'INVALID_INPUT_DATA',
  CLOUDFLARE_CLIENT_NOT_INITIALIZED: 'CLOUDFLARE_CLIENT_NOT_INITIALIZED',
  MULTIPLE_HOSTNAMES_FOUND: 'MULTIPLE_HOSTNAMES_FOUND',
  MISSING_PUBLIC_DOMAIN_URL: 'MISSING_PUBLIC_DOMAIN_URL',
} as const);
const DNS_MANAGER_EXCEPTION_CATEGORY_BY_CODE = {
  [DnsManagerExceptionCode.INTERNAL_SERVER_ERROR]: 'INTERNAL_SERVER_ERROR',
  [DnsManagerExceptionCode.HOSTNAME_ALREADY_REGISTERED]: 'CONFLICT',
  [DnsManagerExceptionCode.HOSTNAME_NOT_REGISTERED]: 'INTERNAL_SERVER_ERROR',
  [DnsManagerExceptionCode.INVALID_INPUT_DATA]: 'INTERNAL_SERVER_ERROR',
  [DnsManagerExceptionCode.CLOUDFLARE_CLIENT_NOT_INITIALIZED]:
    'INTERNAL_SERVER_ERROR',
  [DnsManagerExceptionCode.MULTIPLE_HOSTNAMES_FOUND]: 'INTERNAL_SERVER_ERROR',
  [DnsManagerExceptionCode.MISSING_PUBLIC_DOMAIN_URL]: 'INTERNAL_SERVER_ERROR',
} as const satisfies Record<
  keyof typeof DnsManagerExceptionCode,
  ExceptionCategory
>;
