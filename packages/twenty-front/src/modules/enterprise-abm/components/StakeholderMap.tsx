import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { StakeholderData } from '../types/abm.types';
import { GET_ABM_DATA } from '../hooks/useABM';

const SENTIMENT_COLORS: Record<string, string> = { positive: themeCssVariables.color.green, neutral: themeCssVariables.color.yellow, negative: themeCssVariables.color.red };
const StyledContainer = styled.div` display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[3]}; `;
const StyledTitle = styled.h2` font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0; `;
const StyledGrid = styled.div` display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: ${themeCssVariables.spacing[3]}; @media (max-width: ${MOBILE_VIEWPORT}px) { grid-template-columns: 1fr; } `;
const StyledCard = styled.div` padding: ${themeCssVariables.spacing[3]}; border: 1px solid ${themeCssVariables.border.color.light}; border-radius: 8px; display: flex; flex-direction: column; gap: 4px; `;
const StyledName = styled.span` font-size: ${themeCssVariables.font.size.md}; font-weight: ${themeCssVariables.font.weight.medium}; color: ${themeCssVariables.font.color.primary}; `;
const StyledRole = styled.span` font-size: ${themeCssVariables.font.size.xs}; text-transform: uppercase; color: ${themeCssVariables.font.color.tertiary}; `;
const StyledMeta = styled.span` font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.secondary}; `;
const StyledDot = styled.span<{ color: string }>` display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${({ color }) => color}; margin-right: 4px; `;

export const StakeholderMap = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_ABM_DATA);
  if (loading) return <StyledContainer>{t`Loading...`}</StyledContainer>;
  if (error) return <StyledContainer>{t`Error loading data`}</StyledContainer>;
  const stakeholders: StakeholderData[] = data?.abmData?.stakeholders ?? [];
  return (
    <StyledContainer>
      <StyledTitle>{t`Stakeholder Map`}</StyledTitle>
      <StyledGrid>
        {stakeholders.map((s) => (
          <StyledCard key={s.id}><StyledName>{s.name}</StyledName><StyledMeta>{s.title} &middot; {s.accountName}</StyledMeta><StyledRole>{s.role.replace('_', ' ')}</StyledRole><StyledMeta><StyledDot color={SENTIMENT_COLORS[s.sentiment] ?? themeCssVariables.color.gray50} />{s.sentiment}</StyledMeta></StyledCard>
        ))}
      </StyledGrid>
    </StyledContainer>
  );
};
