import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { useState } from 'react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { GET_ACTIVE_PROJECTS } from '../hooks/useProjects';
import { ProjectData, ProjectHealth, ProjectStatus } from '../types/project.types';

const HEALTH_COLORS: Record<ProjectHealth, string> = {
  on_track: themeCssVariables.color.turquoise,
  at_risk: themeCssVariables.color.yellow,
  off_track: themeCssVariables.color.red,
};

const STATUS_OPTIONS: ProjectStatus[] = [
  'planning',
  'active',
  'on_hold',
  'completed',
];

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledToolbar = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  flex-wrap: wrap;
  align-items: center;
`;

const StyledSelect = styled.select`
  padding: 6px 10px;
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 4px;
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${themeCssVariables.spacing[3]};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
  }
`;

const StyledCard = styled.div<{ healthColor: string }>`
  padding: ${themeCssVariables.spacing[3]};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-left: 4px solid ${({ healthColor }) => healthColor};
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledName = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledDetail = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledBar = styled.div`
  height: 6px;
  border-radius: 3px;
  background: ${themeCssVariables.background.transparent.medium};
  overflow: hidden;
`;

const StyledBarFill = styled.div<{ percent: number; color: string }>`
  height: 100%;
  width: ${({ percent }) => Math.min(percent, 100)}%;
  background: ${({ color }) => color};
  border-radius: 3px;
`;

const StyledLoading = styled.div`
  padding: ${themeCssVariables.spacing[4]};
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledError = styled.div`
  padding: ${themeCssVariables.spacing[4]};
  color: ${themeCssVariables.color.red};
`;

export const ProjectList = () => {
  useLingui();

  const [statusFilter, setStatusFilter] = useState<string>('active');

  const { data, loading, error } = useQuery(GET_ACTIVE_PROJECTS, {
    variables: { status: statusFilter || undefined, limit: 50 },
  });

  if (loading) return <StyledLoading>{t`Loading...`}</StyledLoading>;
  if (error) return <StyledError>{t`Error: ${error.message}`}</StyledError>;

  const projects: ProjectData[] =
    data?.activeProjects?.edges?.map(
      (edge: { node: ProjectData }) => edge.node,
    ) ?? [];

  return (
    <StyledContainer>
      <StyledToolbar>
        <StyledName>{t`Projects`}</StyledName>
        <StyledSelect
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="">{t`All statuses`}</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status.replace('_', ' ')}
            </option>
          ))}
        </StyledSelect>
      </StyledToolbar>

      <StyledGrid>
        {projects.map((project) => {
          const budgetPercent =
            project.budget > 0
              ? Math.round((project.spent / project.budget) * 100)
              : 0;
          const budgetColor =
            budgetPercent > 90
              ? themeCssVariables.color.red
              : budgetPercent > 70
                ? themeCssVariables.color.orange
                : themeCssVariables.color.blue;

          return (
            <StyledCard
              key={project.id}
              healthColor={
                HEALTH_COLORS[project.health] ?? themeCssVariables.color.gray50
              }
            >
              <StyledName>{project.name}</StyledName>
              <StyledDetail>
                {project.owner} - {project.status.replace('_', ' ')}
              </StyledDetail>
              <StyledRow>
                <span>
                  {t`Progress`}: {project.progressPercent}%
                </span>
                <span>{project.health.replace('_', ' ')}</span>
              </StyledRow>
              <StyledBar>
                <StyledBarFill
                  percent={project.progressPercent}
                  color={themeCssVariables.color.blue}
                />
              </StyledBar>
              <StyledRow>
                <span>
                  {t`Budget`}: {project.currency}{' '}
                  {project.budget.toLocaleString()}
                </span>
                <span>
                  {t`Spent`}: {project.currency}{' '}
                  {project.spent.toLocaleString()} ({budgetPercent}%)
                </span>
              </StyledRow>
              <StyledBar>
                <StyledBarFill percent={budgetPercent} color={budgetColor} />
              </StyledBar>
            </StyledCard>
          );
        })}
      </StyledGrid>
    </StyledContainer>
  );
};
