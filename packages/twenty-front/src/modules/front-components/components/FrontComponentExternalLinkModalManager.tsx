import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { FrontComponentExternalLinkModal } from '@/front-components/components/FrontComponentExternalLinkModal';
import { frontComponentExternalLinkModalConfigState } from '@/front-components/states/frontComponentExternalLinkModalConfigState';
import { trustedFrontComponentExternalOriginsState } from '@/front-components/states/trustedFrontComponentExternalOriginsState';
import { openExternalUrl } from '@/front-components/utils/openExternalUrl';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const FrontComponentExternalLinkModalManager = () => {
  const frontComponentExternalLinkModalConfig = useAtomStateValue(
    frontComponentExternalLinkModalConfigState,
  );
  const setFrontComponentExternalLinkModalConfig = useSetAtomState(
    frontComponentExternalLinkModalConfigState,
  );
  const setTrustedFrontComponentExternalOrigins = useSetAtomState(
    trustedFrontComponentExternalOriginsState,
  );
  const [shouldTrustOrigin, setShouldTrustOrigin] = useState(false);

  if (!isDefined(frontComponentExternalLinkModalConfig)) {
    return null;
  }

  const { applicationId, url, origin } = frontComponentExternalLinkModalConfig;

  const handleConfirm = () => {
    if (shouldTrustOrigin) {
      setTrustedFrontComponentExternalOrigins((previousTrustedOrigins) => ({
        ...previousTrustedOrigins,
        [applicationId]: [
          ...(previousTrustedOrigins[applicationId] ?? []),
          origin,
        ],
      }));
    }

    openExternalUrl(url);
    setFrontComponentExternalLinkModalConfig(null);
    setShouldTrustOrigin(false);
  };

  const handleClose = () => {
    setFrontComponentExternalLinkModalConfig(null);
    setShouldTrustOrigin(false);
  };

  return (
    <FrontComponentExternalLinkModal
      url={url}
      shouldTrustOrigin={shouldTrustOrigin}
      onShouldTrustOriginChange={setShouldTrustOrigin}
      onConfirm={handleConfirm}
      onClose={handleClose}
    />
  );
};
