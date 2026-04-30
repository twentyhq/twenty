import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';
import { MigrationData } from '../types/residency.types';
import { GET_DATA_RESIDENCY_DATA } from '../hooks/useDataResidency';

const STATUS_COLORS: Record<string, string> = { completed: themeCssVariables.color.green, in_progress: themeCssVariables.color.blue, pending: themeCssVariables.color.gray50, failed: themeCssVariables.color.red };
const StyledContainer = styled.div` display: flex; flex-direction: column; padding: ${themeCssVariables.spacing[4]}; gap: ${themeCssVariables.spacing[3]}; `;
const StyledTitle = styled.h2` font-size: ${themeCssVariables.font.size.lg}; color: ${themeCssVariables.font.color.primary}; margin: 0; `;
const StyledCard = styled.div` padding: ${themeCssVariables.spacing[3]}; border: 1px solid ${themeCssVariables.border.color.light}; border-radius: 8px; display: flex; flex-direction: column; gap: ${themeCssVariables.spacing[2]}; `;
const StyledCardHeader = styled.div` display: flex; justify-content: space-between; flex-wrap: wrap; gap: ${themeCssVariables.spacing[1]}; @media (max-width: ${MOBILE_VIEWPORT}px) { flex-direction: column; } `;
const StyledRoute = styled.span` font-size: ${themeCssVariables.font.size.md}; font-weight: ${themeCssVariables.font.weight.medium}; color: ${themeCssVariables.font.color.primary}; `;
const StyledBadge = styled.span<{ color: string }>` padding: 2px 8px; border-radius: 4px; font-size: ${themeCssVariables.font.size.xs}; background: ${({ color }) => color}; color: ${themeCssVariables.font.color.inverted}; `;
const StyledProgressBar = styled.div` height: 8px; background: ${themeCssVariables.background.transparent.lighter}; border-radius: 4px; overflow: hidden; `;
const StyledProgressFill = styled.div<{ percentage: number }>` height: 100%; width: ${({ percentage }) => percentage}%; background: ${themeCssVariables.color.blue}; border-radius: 4px; `;
const StyledMeta = styled.span` font-size: ${themeCssVariables.font.size.sm}; color: ${themeCssVariables.font.color.secondary}; `;

export const MigrationStatus = () => {
  useLingui();
  const { data, loading, error } = useQuery(GET_DATA_RESIDENCY_DATA);
  if (loading) return <StyledContainer>{t`Loading...`}</StyledContainer>;
  if (error) return <StyledContainer>{t`Error loading data`}</StyledContainer>;
  const migrations: MigrationData[] = data?.dataresidencyData?.migrations ?? [];
  return (
    <StyledContainer>
      <StyledTitle>{t`Data Migrations`}</StyledTitle>
      {migrations.map((m) => (
        <StyledCard key={m.id}><StyledCardHeader><StyledRoute>{m.sourceRegion} &rarr; {m.targetRegion}</StyledRoute><StyledBadge color={STATUS_COLORS[m.status] ?? themeCssVariables.color.gray50}>{m.status}</StyledBadge></StyledCardHeader><StyledProgressBar><StyledProgressFill percentage={m.progress} /></StyledProgressBar><StyledMeta>{m.dataSize} &middot; {m.progress}%</StyledMeta></StyledCard>
      ))}
    </StyledContainer>
  );
};
