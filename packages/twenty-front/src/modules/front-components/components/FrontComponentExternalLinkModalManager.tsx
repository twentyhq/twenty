import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Checkbox } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { FRONT_COMPONENT_EXTERNAL_LINK_MODAL_ID } from '@/front-components/constants/FrontComponentExternalLinkModalId';
import { frontComponentExternalLinkModalConfigState } from '@/front-components/states/frontComponentExternalLinkModalConfigState';
import { trustedFrontComponentExternalOriginsState } from '@/front-components/states/trustedFrontComponentExternalOriginsState';
import { openExternalUrl } from '@/front-components/utils/openExternalUrl';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

const StyledSubtitle = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledDestinationUrl = styled.div`
  background-color: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.font.family};
  max-width: 100%;
  overflow-wrap: anywhere;
  padding: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledTrustRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTrustLabel = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
`;

const TRUST_ORIGIN_LABEL_ID =
  'front-component-external-link-trust-origin-label';

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

  const { applicationId, url, origin, target } =
    frontComponentExternalLinkModalConfig;

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

    openExternalUrl(url, target);
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
        <StyledSubtitle>
          {t`This link will take you to an external site:`}
          <StyledDestinationUrl>{url}</StyledDestinationUrl>
          <StyledTrustRow>
            <Checkbox
              checked={shouldTrustOrigin}
              onCheckedChange={setShouldTrustOrigin}
              aria-labelledby={TRUST_ORIGIN_LABEL_ID}
            />
            <StyledTrustLabel
              id={TRUST_ORIGIN_LABEL_ID}
              onClick={() => setShouldTrustOrigin((previous) => !previous)}
            >
              {t`Don't ask again for ${origin}`}
            </StyledTrustLabel>
          </StyledTrustRow>
        </StyledSubtitle>
      }
      confirmButtonText={t`Continue`}
      confirmButtonAccent="blue"
      onConfirmClick={handleConfirmClick}
      onClose={handleClose}
    />
  );
};
