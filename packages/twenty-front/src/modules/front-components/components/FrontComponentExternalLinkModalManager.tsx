import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { FrontComponentExternalLinkModalSubtitle } from '@/front-components/components/FrontComponentExternalLinkModalSubtitle';
import { FRONT_COMPONENT_EXTERNAL_LINK_MODAL_ID } from '@/front-components/constants/FrontComponentExternalLinkModalId';
import { frontComponentExternalLinkModalConfigState } from '@/front-components/states/frontComponentExternalLinkModalConfigState';
import { trustedFrontComponentExternalOriginsState } from '@/front-components/states/trustedFrontComponentExternalOriginsState';
import { openExternalUrl } from '@/front-components/utils/openExternalUrl';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
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
  const [shouldTrustOrigin, setShouldTrustOrigin] = useState(true);

  if (!isDefined(frontComponentExternalLinkModalConfig)) {
    return null;
  }

  const { applicationId, url, origin } = frontComponentExternalLinkModalConfig;

  const handleConfirmClick = () => {
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
    setShouldTrustOrigin(true);
  };

  const handleClose = () => {
    setFrontComponentExternalLinkModalConfig(null);
    setShouldTrustOrigin(true);
  };

  return (
    <ConfirmationModal
      modalInstanceId={FRONT_COMPONENT_EXTERNAL_LINK_MODAL_ID}
      title={t`You're leaving Twenty`}
      subtitle={
        <FrontComponentExternalLinkModalSubtitle
          url={url}
          origin={origin}
          shouldTrustOrigin={shouldTrustOrigin}
          onShouldTrustOriginChange={setShouldTrustOrigin}
        />
      }
      confirmButtonText={t`Continue`}
      confirmButtonAccent="blue"
      onConfirmClick={handleConfirmClick}
      onClose={handleClose}
    />
  );
};
