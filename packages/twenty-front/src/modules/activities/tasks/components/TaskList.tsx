import styled from '@emotion/styled';
import { type ReactElement } from 'react';

import { ActivityList } from '@/activities/components/ActivityList';
import { type Task } from '@/activities/types/Task';
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
  padding: 8px ${({ theme }) => theme.spacing(6)};

  width: calc(100% - ${({ theme }) => theme.spacing(12)});
`;

const StyledTitleBar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(4)};
  place-items: center;
  width: 100%;
`;

const StyledTitle = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledCount = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  margin-left: ${({ theme }) => theme.spacing(2)};
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
