import { msg } from '@lingui/core/macro';

import type Cloudflare from 'cloudflare';

import {
  DnsManagerException,
  DnsManagerExceptionCode,
} from 'src/engine/core-modules/dns-manager/exceptions/dns-manager.exception';

const isCloudflareInstanceDefined = (
  cloudflareInstance: Cloudflare | undefined | null,
): asserts cloudflareInstance is Cloudflare => {
  if (!cloudflareInstance) {
    throw new DnsManagerException(
      'Cloudflare instance is not defined',
      DnsManagerExceptionCode.CLOUDFLARE_CLIENT_NOT_INITIALIZED,
      {
        userFriendlyMessage: msg`Environment variable CLOUDFLARE_API_KEY must be defined to use this feature.`,
      },
    );
  }
};

export const dnsManagerValidator: {
  isCloudflareInstanceDefined: typeof isCloudflareInstanceDefined;
} = {
  isCloudflareInstanceDefined,
};
