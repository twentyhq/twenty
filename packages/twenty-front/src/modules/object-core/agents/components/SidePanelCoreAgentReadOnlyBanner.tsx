import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

import { SidePanelInformationBanner } from '@/side-panel/components/SidePanelInformationBanner/SidePanelInformationBanner';

const StyledBannerContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

type SidePanelCoreAgentReadOnlyBannerProps = {
  message: string;
};

export const SidePanelCoreAgentReadOnlyBanner = ({
  message,
}: SidePanelCoreAgentReadOnlyBannerProps) => (
  <StyledBannerContainer>
    <SidePanelInformationBanner message={message} />
  </StyledBannerContainer>
);
