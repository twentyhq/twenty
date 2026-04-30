import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { MigrationData } from '../types/residency.types';

const MOCK_MIGRATIONS: MigrationData[] = [
  { id: 'MG-1', sourceRegion: 'us_east', targetRegion: 'eu_west', status: 'completed', progress: 100, startedAt: '2026-04-20T08:00:00Z', estimatedCompletion: '2026-04-22T08:00:00Z', dataSize: '2.4 TB' },
  { id: 'MG-2', sourceRegion: 'us_east', targetRegion: 'latam', status: 'in_progress', progress: 67, startedAt: '2026-04-27T10:00:00Z', estimatedCompletion: '2026-04-29T18:00:00Z', dataSize: '1.1 TB' },
  { id: 'MG-3', sourceRegion: 'eu_west', targetRegion: 'eu_central', status: 'pending', progress: 0, startedAt: '2026-05-01T06:00:00Z', estimatedCompletion: '2026-05-02T06:00:00Z', dataSize: '800 GB' },
];

const STATUS_COLORS: Record<string, string> = {
  completed: themeCssVariables.color.green,
  in_progress: themeCssVariables.color.blue,
  pending: themeCssVariables.color.gray50,
  failed: themeCssVariables.color.red,
};

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

const StyledCard = styled.div`
  padding: ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: column;
  }
`;

const StyledRoute = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledBadge = styled.span<{ color: string }>`
  padding: 2px 8px;
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.xs};
  background: ${({ color }) => color};
  color: ${themeCssVariables.font.color.inverted};
`;

const StyledProgressBar = styled.div`
  height: 8px;
  background: ${themeCssVariables.background.transparent.lighter};
  border-radius: 4px;
  overflow: hidden;
`;

const StyledProgressFill = styled.div<{ percentage: number }>`
  height: 100%;
  width: ${({ percentage }) => percentage}%;
  background: ${themeCssVariables.color.blue};
  border-radius: 4px;
`;

const StyledMeta = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

export const MigrationStatus = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Data Migrations`}</StyledTitle>
      {MOCK_MIGRATIONS.map((migration) => (
        <StyledCard key={migration.id}>
          <StyledCardHeader>
            <StyledRoute>{migration.sourceRegion} &rarr; {migration.targetRegion}</StyledRoute>
            <StyledBadge color={STATUS_COLORS[migration.status]}>{migration.status}</StyledBadge>
          </StyledCardHeader>
          <StyledProgressBar>
            <StyledProgressFill percentage={migration.progress} />
          </StyledProgressBar>
          <StyledMeta>{migration.dataSize} &middot; {migration.progress}%</StyledMeta>
        </StyledCard>
      ))}
    </StyledContainer>
  );
};
