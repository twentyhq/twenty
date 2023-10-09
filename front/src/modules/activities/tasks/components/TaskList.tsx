import { ReactElement } from 'react';
import styled from '@emotion/styled';

import { TaskForList } from '@/activities/types/TaskForList';

import { TaskRow } from './TaskRow';

type TaskListProps = {
  title?: string;
  tasks: TaskForList[];
  button?: ReactElement | false;
};

const StyledContainer = styled.div`
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 8px 24px;
`;

const StyledTitleBar = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(4)};
  place-items: center;
  width: 100%;
`;

const StyledTitle = styled.h3`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledCount = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  margin-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledTaskRows = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  width: 100%;
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
        <StyledTaskRows>
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </StyledTaskRows>
      </StyledContainer>
    )}
  </>
);
