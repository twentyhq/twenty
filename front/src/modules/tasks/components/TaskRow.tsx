import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { ActivityTargetChips } from '@/activities/components/ActivityTargetChips';
import { useOpenActivityRightDrawer } from '@/activities/hooks/useOpenActivityRightDrawer';
import { IconCalendar, IconComment } from '@/ui/icon';
import {
  Checkbox,
  CheckboxShape,
} from '@/ui/input/checkbox/components/Checkbox';
import { useGetCompaniesQuery, useGetPeopleQuery } from '~/generated/graphql';
import { beautifyExactDate } from '~/utils/date-utils';

import { TaskForList } from '../types/TaskForList';

const StyledContainer = styled.div`
  align-items: center;
  align-self: stretch;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  cursor: pointer;
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
  const openActivityRightDrawer = useOpenActivityRightDrawer();
  const { data: targetPeople } = useGetPeopleQuery({
    variables: {
      where: {
        id: {
          in: task?.activityTargets
            ? task?.activityTargets
                .filter((target) => target.commentableType === 'Person')
                .map((target) => target.commentableId ?? '')
            : [],
        },
      },
    },
  });

  const { data: targetCompanies } = useGetCompaniesQuery({
    variables: {
      where: {
        id: {
          in: task?.activityTargets
            ? task?.activityTargets
                .filter((target) => target.commentableType === 'Company')
                .map((target) => target.commentableId ?? '')
            : [],
        },
      },
    },
  });

  return (
    <StyledContainer
      onClick={() => {
        openActivityRightDrawer(task.id);
      }}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <Checkbox checked={false} shape={CheckboxShape.Rounded} />
      </div>
      <StyledTaskTitle>{task.title}</StyledTaskTitle>
      {task.comments && task.comments.length > 0 && (
        <StyledCommentIcon>
          <IconComment size={theme.icon.size.md} />
        </StyledCommentIcon>
      )}
      <StyledSeparator />
      <ActivityTargetChips
        targetCompanies={targetCompanies}
        targetPeople={targetPeople}
      />
      <StyledDueDate>
        <IconCalendar size={theme.icon.size.md} />
        {task.dueAt && beautifyExactDate(task.dueAt)}
      </StyledDueDate>
    </StyledContainer>
  );
}
