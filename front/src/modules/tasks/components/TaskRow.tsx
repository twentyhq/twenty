import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconCalendar, IconComment } from '@/ui/icon';
import {
  Checkbox,
  CheckboxShape,
} from '@/ui/input/checkbox/components/Checkbox';
import { UserChip } from '@/users/components/UserChip';
import { beautifyExactDate } from '~/utils/date-utils';

import { TaskForList } from '../types/TaskForList';

const StyledContainer = styled.div`
  align-items: center;
  align-self: stretch;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  height: ${({ theme }) => theme.spacing(12)};
  padding: 0 ${({ theme }) => theme.spacing(4)};
`;

const StyledSeparator = styled.div`
  flex: 1;
`;

const StyledTaskTitle = styled.div`
  padding: 0 ${({ theme }) => theme.spacing(2)};
`;

const StyledCommentIcon = styled.div`
  color: ${({ theme }) => theme.font.color.light};
`;

const StyledDueDate = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  gap: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

export function TaskRow({ task }: { task: TaskForList }) {
  const theme = useTheme();
  return (
    <StyledContainer>
      <Checkbox checked={false} shape={CheckboxShape.Rounded} />
      <StyledTaskTitle>{task.title}</StyledTaskTitle>
      {task.comments && task.comments.length > 0 && (
        <StyledCommentIcon>
          <IconComment size={theme.icon.size.md} />
        </StyledCommentIcon>
      )}
      <StyledSeparator />
      {task.assignee && (
        <UserChip
          id={task.assignee.id}
          name={task.assignee.displayName ?? ''}
          pictureUrl={task.assignee.avatarUrl ?? ''}
        />
      )}
      <StyledDueDate>
        <IconCalendar size={theme.icon.size.md} />
        {task.dueAt && beautifyExactDate(task.dueAt)}
      </StyledDueDate>
    </StyledContainer>
  );
}
