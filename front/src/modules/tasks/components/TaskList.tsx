import styled from '@emotion/styled';

import { TaskForList } from '../types/TaskForList';

import { TaskRow } from './TaskRow';

type OwnProps = {
  title: string;
  tasks: TaskForList[];
};

const StyledContainer = styled.div`
  align-items: flex-start;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 8px 24px;
`;

const StyledTitle = styled.h3`
  color: ${({ theme }) => theme.font.color.primary};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(4)};
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

const StyledEmptyListMessage = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  padding: ${({ theme }) => theme.spacing(4)};
`;

export function TaskList({ title, tasks }: OwnProps) {
  return (
    <StyledContainer>
      <StyledTitle>
        {title} <StyledCount>{tasks ? tasks.length : 0}</StyledCount>
      </StyledTitle>
      {tasks && tasks.length > 0 ? (
        <StyledTaskRows>
          {tasks.map((task) => (
            <TaskRow key={task.id} task={task} />
          ))}
        </StyledTaskRows>
      ) : (
        <StyledEmptyListMessage>No task in this section</StyledEmptyListMessage>
      )}
    </StyledContainer>
  );
}
