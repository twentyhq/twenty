import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { ProjectData, ProjectHealth } from '../types/project.types';

const MOCK_PROJECTS: ProjectData[] = [
  { id: 'P1', name: 'CRM Migration', description: 'Migrate legacy CRM', status: 'active', health: 'on_track', owner: 'Ana Torres', startDate: '2026-01-15', endDate: '2026-06-30', progressPercent: 65, budget: 120000, spent: 78000, currency: 'COP' },
  { id: 'P2', name: 'Mobile App v2', description: 'Rebuild mobile app', status: 'active', health: 'at_risk', owner: 'Diego Vargas', startDate: '2026-02-01', endDate: '2026-08-15', progressPercent: 35, budget: 200000, spent: 95000, currency: 'COP' },
  { id: 'P3', name: 'Data Warehouse', description: 'Build analytics DW', status: 'planning', health: 'on_track', owner: 'Carlos Mendez', startDate: '2026-05-01', endDate: '2026-12-31', progressPercent: 5, budget: 300000, spent: 10000, currency: 'COP' },
  { id: 'P4', name: 'Security Audit', description: 'Annual security review', status: 'active', health: 'off_track', owner: 'Maria Lopez', startDate: '2026-03-01', endDate: '2026-04-30', progressPercent: 50, budget: 45000, spent: 42000, currency: 'COP' },
];

const HEALTH_COLORS: Record<ProjectHealth, string> = {
  on_track: themeCssVariables.color.turquoise,
  at_risk: themeCssVariables.color.yellow,
  off_track: themeCssVariables.color.red,
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

const StyledBarFill = styled.div<{ percent: number }>`
  height: 100%;
  width: ${({ percent }) => percent}%;
  background: ${themeCssVariables.color.blue};
  border-radius: 3px;
`;

export const ProjectList = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Projects`}</StyledTitle>
      <StyledGrid>
        {MOCK_PROJECTS.map((project) => (
          <StyledCard key={project.id} healthColor={HEALTH_COLORS[project.health]}>
            <StyledName>{project.name}</StyledName>
            <StyledDetail>{project.owner} - {project.status}</StyledDetail>
            <StyledRow>
              <span>{t`Progress`}: {project.progressPercent}%</span>
              <span>{project.health.replace('_', ' ')}</span>
            </StyledRow>
            <StyledBar>
              <StyledBarFill percent={project.progressPercent} />
            </StyledBar>
            <StyledRow>
              <span>{t`Budget`}: ${project.budget.toLocaleString()}</span>
              <span>{t`Spent`}: ${project.spent.toLocaleString()}</span>
            </StyledRow>
          </StyledCard>
        ))}
      </StyledGrid>
    </StyledContainer>
  );
};
