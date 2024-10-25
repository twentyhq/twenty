import styled from '@emotion/styled';

import { Card, CardContent } from 'twenty-ui';

import PreviewBackgroundImage from '../assets/preview-background.svg';
import SyncImage from '../assets/sync.svg?react';

type SettingsIntegrationPreviewProps = {
  integrationLogoUrl: string;
};

const StyledCard = styled(Card)`
  border: 0;
`;

const StyledCardContent = styled(CardContent)`
  background-image: url(${PreviewBackgroundImage});
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(1)};
  height: ${({ theme }) => theme.spacing(28)};
`;

const StyledLogosContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledIntegrationLogoContainer = styled.div`
  align-items: center;
  display: flex;
  height: ${({ theme }) => theme.spacing(16)};
  justify-content: center;
  width: ${({ theme }) => theme.spacing(16)};
`;

const StyledIntegrationLogo = styled.img`
  height: 100%;
`;

const StyledTwentyLogo = styled.img`
  height: ${({ theme }) => theme.spacing(12)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledSyncImage = styled(SyncImage)`
  width: ${({ theme }) => theme.spacing(31)};
`;

const StyledLabel = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  line-height: ${({ theme }) => theme.spacing(6)};
`;

export const SettingsIntegrationPreview = ({
  integrationLogoUrl,
}: SettingsIntegrationPreviewProps) => (
  <StyledCard>
    <StyledCardContent>
      <StyledLogosContainer>
        <StyledIntegrationLogoContainer>
          <StyledIntegrationLogo alt="" src={integrationLogoUrl} />
        </StyledIntegrationLogoContainer>
        <StyledSyncImage />
        <StyledTwentyLogo alt="" src="/images/integrations/twenty-logo.svg" />
      </StyledLogosContainer>
      <StyledLabel>Import your tables as remote objects</StyledLabel>
    </StyledCardContent>
  </StyledCard>
);
