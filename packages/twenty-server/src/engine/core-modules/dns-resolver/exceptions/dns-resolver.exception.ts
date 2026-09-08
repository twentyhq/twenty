import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export class DnsResolverException extends CustomException<
  keyof typeof DnsResolverExceptionCode
> {
  constructor(
    message: string,
    code: keyof typeof DnsResolverExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ?? msg`A DNS resolution error occurred.`,
    });
  }
}

export const DnsResolverExceptionCode = appendCommonExceptionCode({
  NO_AVAILABLE_HOSTNAME: 'NO_AVAILABLE_HOSTNAME',
} as const);
