import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { MarketplaceModuleData } from '../types/saas.types';

const MOCK_MODULES: MarketplaceModuleData[] = [
  { id: 'MM-1', name: 'Advanced Analytics', description: 'Deep insights with custom dashboards', category: 'Analytics', price: 49, isInstalled: true, rating: 4.8, installs: 320 },
  { id: 'MM-2', name: 'Email Campaigns', description: 'Automated email sequences and tracking', category: 'Marketing', price: 29, isInstalled: false, rating: 4.5, installs: 540 },
  { id: 'MM-3', name: 'Document Signing', description: 'E-signature integration for contracts', category: 'Sales', price: 39, isInstalled: true, rating: 4.7, installs: 280 },
  { id: 'MM-4', name: 'AI Lead Scoring', description: 'ML-powered lead prioritization', category: 'AI', price: 79, isInstalled: false, rating: 4.3, installs: 150 },
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

const StyledCard = styled.div`
  padding: ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledModuleName = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledDescription = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledPrice = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledButton = styled.span<{ isInstalled: boolean }>`
  padding: 4px 12px;
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.xs};
  background: ${({ isInstalled }) =>
    isInstalled ? themeCssVariables.color.green : themeCssVariables.color.blue};
  color: ${themeCssVariables.font.color.inverted};
  cursor: pointer;
`;

export const ModuleMarketplace = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Module Marketplace`}</StyledTitle>
      <StyledGrid>
        {MOCK_MODULES.map((module) => (
          <StyledCard key={module.id}>
            <StyledModuleName>{module.name}</StyledModuleName>
            <StyledDescription>{module.description}</StyledDescription>
            <StyledFooter>
              <StyledPrice>${module.price}/mo</StyledPrice>
              <StyledButton isInstalled={module.isInstalled}>
                {module.isInstalled ? t`Installed` : t`Activate`}
              </StyledButton>
            </StyledFooter>
          </StyledCard>
        ))}
      </StyledGrid>
    </StyledContainer>
  );
};
