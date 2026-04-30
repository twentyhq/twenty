import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { GanttTask } from '../types/project.types';

const MOCK_TASKS: GanttTask[] = [
  { id: 'G1', name: 'Requirements', startDate: '2026-04-01', endDate: '2026-04-15', progressPercent: 100, assignee: 'Ana Torres' },
  { id: 'G2', name: 'Design', startDate: '2026-04-10', endDate: '2026-04-30', progressPercent: 80, assignee: 'Diego Vargas' },
  { id: 'G3', name: 'Backend Dev', startDate: '2026-04-20', endDate: '2026-05-31', progressPercent: 30, assignee: 'Camila Ortiz' },
  { id: 'G4', name: 'Frontend Dev', startDate: '2026-05-01', endDate: '2026-06-15', progressPercent: 10, assignee: 'Diego Vargas' },
  { id: 'G5', name: 'Testing', startDate: '2026-06-01', endDate: '2026-06-30', progressPercent: 0, assignee: 'Pedro Ruiz' },
];

const TIMELINE_START = new Date('2026-04-01');
const TIMELINE_END = new Date('2026-06-30');
const TOTAL_DAYS = Math.ceil((TIMELINE_END.getTime() - TIMELINE_START.getTime()) / 86400000);

const getOffset = (dateStr: string) => {
  const days = Math.ceil((new Date(dateStr).getTime() - TIMELINE_START.getTime()) / 86400000);
  return Math.max(0, (days / TOTAL_DAYS) * 100);
};

const getWidth = (startStr: string, endStr: string) => {
  const days = Math.ceil((new Date(endStr).getTime() - new Date(startStr).getTime()) / 86400000);
  return Math.max(2, (days / TOTAL_DAYS) * 100);
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[3]};
  overflow-x: auto;
`;

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg};
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[2]};
  min-height: 36px;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const StyledLabel = styled.div`
  width: 140px;
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.primary};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: 100%;
  }
`;

const StyledTimeline = styled.div`
  flex: 1;
  position: relative;
  height: 24px;
  background: ${themeCssVariables.background.transparent.lighter};
  border-radius: 4px;
  min-width: 300px;
`;

const StyledBar = styled.div<{ left: number; width: number }>`
  position: absolute;
  left: ${({ left }) => left}%;
  width: ${({ width }) => width}%;
  height: 100%;
  background: ${themeCssVariables.color.blue};
  border-radius: 4px;
  opacity: 0.8;
`;

const StyledProgress = styled.div<{ percent: number }>`
  height: 100%;
  width: ${({ percent }) => percent}%;
  background: ${themeCssVariables.color.turquoise};
  border-radius: 4px;
`;

const StyledAssignee = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.tertiary};
  width: 100px;
  flex-shrink: 0;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: 100%;
  }
`;

export const ProjectGantt = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Project Timeline`}</StyledTitle>
      {MOCK_TASKS.map((task) => (
        <StyledRow key={task.id}>
          <StyledLabel>{task.name}</StyledLabel>
          <StyledTimeline>
            <StyledBar left={getOffset(task.startDate)} width={getWidth(task.startDate, task.endDate)}>
              <StyledProgress percent={task.progressPercent} />
            </StyledBar>
          </StyledTimeline>
          <StyledAssignee>{task.assignee}</StyledAssignee>
        </StyledRow>
      ))}
    </StyledContainer>
  );
};
