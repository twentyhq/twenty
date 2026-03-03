import { styled } from '@linaria/react';
import { type ReactElement } from 'react';

import { ActivityList } from '@/activities/components/ActivityList';
import { type Task } from '@/activities/types/Task';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { TaskRow } from './TaskRow';

type TaskListProps = {
  title: string;
  tasks: Task[];
  button?: ReactElement | false;
};

const StyledContainer = styled.div`
  align-items: flex-start;
  width: 100%;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 8px ${themeCssVariables.spacing[6]};

  width: calc(100% - ${themeCssVariables.spacing[12]});
`;

const StyledTitleBar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${themeCssVariables.spacing[4]};
  margin-top: ${themeCssVariables.spacing[4]};
  place-items: center;
  width: 100%;
`;

const StyledTitle = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledCount = styled.span`
  color: ${themeCssVariables.font.color.light};
  margin-left: ${themeCssVariables.spacing[2]};
`;

export const TaskList = ({ title, tasks, button }: TaskListProps) => (
  <>
    {tasks && tasks.length > 0 && (
      <StyledContainer>
        <StyledTitleBar>
          {title && (
            <StyledTitle>
              {title} <StyledCount>{tasks.length}</StyledCount>
            </StyledTitle>
          )}
          {button}
        </StyledTitleBar>
        <ActivityList>
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </ActivityList>
      </StyledContainer>
    )}
  </>
);
