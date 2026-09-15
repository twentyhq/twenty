import { styled } from '@linaria/react';

import { ActivityList } from '@/activities/components/ActivityList';
import { type Task } from '@/activities/types/Task';
import { SelectDisplay } from 'twenty-ui/data-display';
import { type ThemeColor } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { TaskRow } from './TaskRow';

type TaskListProps = {
  title: string;
  titleColor: ThemeColor | 'transparent';
  tasks: Task[];
  isFirst: boolean;
};

const StyledContainer = styled.div`
  align-items: flex-start;
  align-self: stretch;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
`;

const StyledTitleBar = styled.div<{ isFirst: boolean }>`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${themeCssVariables.spacing[3]};
  margin-top: ${({ isFirst }) =>
    isFirst ? '0' : themeCssVariables.spacing[4]};
  place-items: center;
  width: 100%;
`;

const StyledTitle = styled.span`
  display: flex;
`;

const StyledCount = styled.span`
  color: ${themeCssVariables.font.color.light};
  margin-left: ${themeCssVariables.spacing[2]};
`;

export const TaskList = ({
  title,
  titleColor,
  tasks,
  isFirst,
}: TaskListProps) => (
  <>
    {tasks.length > 0 && (
      <StyledContainer>
        <StyledTitleBar isFirst={isFirst}>
          {title && (
            <StyledTitle>
              <SelectDisplay color={titleColor} label={title} />
              <StyledCount>{tasks.length}</StyledCount>
            </StyledTitle>
          )}
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
