import Cloudflare from 'cloudflare';
import { t } from '@lingui/core/macro';

import {
  DomainManagerException,
  DomainManagerExceptionCode,
} from 'src/engine/core-modules/domain-manager/domain-manager.exception';

const isCloudflareInstanceDefined = (
  cloudflareInstance: Cloudflare | undefined | null,
): asserts cloudflareInstance is Cloudflare => {
  if (!cloudflareInstance) {
    throw new DomainManagerException(
      'Cloudflare instance is not defined',
      DomainManagerExceptionCode.CLOUDFLARE_CLIENT_NOT_INITIALIZED,
      {
        userFriendlyMessage: t`Environnement variable CLOUDFLARE_API_KEY must be defined to use this feature.`,
      },
    );
  }
};

export const domainManagerValidator: {
  isCloudflareInstanceDefined: typeof isCloudflareInstanceDefined;
} = {
  isCloudflareInstanceDefined,
};
