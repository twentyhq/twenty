import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { GET_GANTT_DATA } from '../hooks/useProjects';
import { GanttTask } from '../types/project.types';

type ProjectGanttProps = {
  projectId: string;
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

const StyledDetail = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.secondary};
`;

const StyledError = styled.div`
  color: ${themeCssVariables.color.red};
  padding: ${themeCssVariables.spacing[4]};
`;

export const ProjectGantt = ({ projectId }: ProjectGanttProps) => {
  useLingui();

  const { data, loading, error } = useQuery(GET_GANTT_DATA, {
    variables: { projectId },
  });

  if (loading) {
    return (
      <StyledContainer>
        <StyledTitle>{t`Project Timeline`}</StyledTitle>
        <StyledDetail>{t`Loading...`}</StyledDetail>
      </StyledContainer>
    );
  }

  if (error) {
    return (
      <StyledContainer>
        <StyledTitle>{t`Project Timeline`}</StyledTitle>
        <StyledError>{t`Error loading timeline`}: {error.message}</StyledError>
      </StyledContainer>
    );
  }

  const tasks: GanttTask[] = data?.ganttData?.tasks ?? [];

  if (tasks.length === 0) {
    return (
      <StyledContainer>
        <StyledTitle>{t`Project Timeline`}</StyledTitle>
        <StyledDetail>{t`No tasks found`}</StyledDetail>
      </StyledContainer>
    );
  }

  const dates = tasks.flatMap((task) => [
    new Date(task.startDate).getTime(),
    new Date(task.endDate).getTime(),
  ]);
  const timelineStart = new Date(Math.min(...dates));
  const timelineEnd = new Date(Math.max(...dates));
  const totalDays = Math.max(
    1,
    Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / 86400000),
  );

  const getOffset = (dateStr: string) => {
    const days = Math.ceil(
      (new Date(dateStr).getTime() - timelineStart.getTime()) / 86400000,
    );
    return Math.max(0, (days / totalDays) * 100);
  };

  const getWidth = (startStr: string, endStr: string) => {
    const days = Math.ceil(
      (new Date(endStr).getTime() - new Date(startStr).getTime()) / 86400000,
    );
    return Math.max(2, (days / totalDays) * 100);
  };

  return (
    <StyledContainer>
      <StyledTitle>{t`Project Timeline`}</StyledTitle>
      {tasks.map((task) => (
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
