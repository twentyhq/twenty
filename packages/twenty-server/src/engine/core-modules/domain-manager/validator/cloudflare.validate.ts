import Cloudflare from 'cloudflare';

import {
  DomainManagerException,
  DomainManagerExceptionCode,
} from 'src/engine/core-modules/domain-manager/domain-manager.exception';

const isExist = (
  cloudflareInstance: Cloudflare | undefined | null,
): asserts cloudflareInstance is Cloudflare => {
  if (!cloudflareInstance) {
    throw new DomainManagerException(
      'Cloudflare instance is not defined',
      DomainManagerExceptionCode.CLOUDFLARE_CLIENT_NOT_INITIALIZED,
    );
  }
};

export const domainManagerValidator: {
  isExist: typeof isExist;
} = {
  isExist,
};
