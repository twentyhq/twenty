import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { MarketplaceModuleData } from '../types/saas.types';
import { GET_SAAS_PLATFORM_DATA } from '../hooks/useSaaSPlatform';

const StyledContainer = styled.div` display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[3]}; `;
const StyledTitle = styled.h2` font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0; `;
const StyledGrid = styled.div` display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: ${themeCssVariables.spacing[3]}; @media (max-width: ${MOBILE_VIEWPORT}px) { grid-template-columns: 1fr; } `;
const StyledCard = styled.div` padding: ${themeCssVariables.spacing[3]}; border: 1px solid ${themeCssVariables.border.color.light}; border-radius: 8px; display: flex; flex-direction: column; gap: ${themeCssVariables.spacing[2]}; `;
const StyledModuleName = styled.span` font-size: ${themeCssVariables.font.size.md}; font-weight: ${themeCssVariables.font.weight.medium}; color: ${themeCssVariables.font.color.primary}; `;
const StyledDescription = styled.span` font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.secondary}; `;
const StyledFooter = styled.div` display: flex; justify-content: space-between; align-items: center; `;
const StyledPrice = styled.span` font-size: ${themeCssVariables.font.size.md}; font-weight: ${themeCssVariables.font.weight.medium}; color: ${themeCssVariables.font.color.primary}; `;
const StyledButton = styled.span<{ isInstalled: boolean }>` padding: 4px 12px; border-radius: 4px; font-size: ${themeCssVariables.font.size.xs}; background: ${({ isInstalled }) => isInstalled ? themeCssVariables.color.green : themeCssVariables.color.blue}; color: ${themeCssVariables.font.color.inverted}; cursor: pointer; `;

export const ModuleMarketplace = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_SAAS_PLATFORM_DATA);
  if (loading) return <StyledContainer>{t`Loading...`}</StyledContainer>;
  if (error) return <StyledContainer>{t`Error loading data`}</StyledContainer>;
  const modules: MarketplaceModuleData[] = data?.saasplatformData?.modules ?? [];
  return (
    <StyledContainer>
      <StyledTitle>{t`Module Marketplace`}</StyledTitle>
      <StyledGrid>
        {modules.map((m) => (<StyledCard key={m.id}><StyledModuleName>{m.name}</StyledModuleName><StyledDescription>{m.description}</StyledDescription><StyledFooter><StyledPrice>${m.price}/mo</StyledPrice><StyledButton isInstalled={m.isInstalled}>{m.isInstalled ? t`Installed` : t`Activate`}</StyledButton></StyledFooter></StyledCard>))}
      </StyledGrid>
    </StyledContainer>
  );
};
