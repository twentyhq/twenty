import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { RegionData } from '../types/residency.types';

const MOCK_REGIONS: RegionData[] = [
  { id: 'R-1', code: 'us_east', name: 'US East (Virginia)', provider: 'AWS', complianceFrameworks: ['soc2', 'hipaa', 'ccpa'], isAvailable: true },
  { id: 'R-2', code: 'eu_west', name: 'EU West (Ireland)', provider: 'AWS', complianceFrameworks: ['gdpr', 'soc2'], isAvailable: true },
  { id: 'R-3', code: 'eu_central', name: 'EU Central (Frankfurt)', provider: 'AWS', complianceFrameworks: ['gdpr', 'soc2'], isAvailable: true },
  { id: 'R-4', code: 'latam', name: 'LATAM (Sao Paulo)', provider: 'AWS', complianceFrameworks: ['lgpd', 'soc2'], isAvailable: true },
  { id: 'R-5', code: 'apac', name: 'APAC (Singapore)', provider: 'AWS', complianceFrameworks: ['soc2'], isAvailable: false },
];

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg};
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: ${themeCssVariables.spacing[3]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
  }
`;

const StyledCard = styled.div<{ isAvailable: boolean }>`
  padding: ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: 8px;
  opacity: ${({ isAvailable }) => (isAvailable ? 1 : 0.5)};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledRegionName = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledProvider = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledBadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const StyledBadge = styled.span`
  padding: 2px 6px;
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.xs};
  background: ${themeCssVariables.background.transparent.lighter};
  color: ${themeCssVariables.font.color.tertiary};
  text-transform: uppercase;
`;

export const RegionSelector = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Data Regions`}</StyledTitle>
      <StyledGrid>
        {MOCK_REGIONS.map((region) => (
          <StyledCard key={region.id} isAvailable={region.isAvailable}>
            <StyledRegionName>{region.name}</StyledRegionName>
            <StyledProvider>{region.provider} &middot; {region.isAvailable ? t`Available` : t`Coming Soon`}</StyledProvider>
            <StyledBadgeRow>
              {region.complianceFrameworks.map((framework) => (
                <StyledBadge key={framework}>{framework}</StyledBadge>
              ))}
            </StyledBadgeRow>
          </StyledCard>
        ))}
      </StyledGrid>
    </StyledContainer>
  );
};
