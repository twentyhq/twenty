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
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

const StyledTaskRows = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  width: 100%;
`;

export function TaskList({ title, tasks }: OwnProps) {
  return (
    <StyledContainer>
      <StyledTitle>{title}</StyledTitle>
      <StyledTaskRows>
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
      </StyledTaskRows>
    </StyledContainer>
  );
}
