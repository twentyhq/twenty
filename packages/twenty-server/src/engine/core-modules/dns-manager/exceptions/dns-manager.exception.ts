import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import {
  appendCommonExceptionCode,
  CustomException,
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
