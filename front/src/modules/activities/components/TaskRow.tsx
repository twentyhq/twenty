import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { ActivityTargetChips } from '@/activities/components/ActivityTargetChips';
import { useOpenActivityRightDrawer } from '@/activities/hooks/useOpenActivityRightDrawer';
import { IconCalendar, IconComment } from '@/ui/icon';
import {
  Checkbox,
  CheckboxShape,
} from '@/ui/input/checkbox/components/Checkbox';
import { OverflowingTextWithTooltip } from '@/ui/tooltip/OverflowingTextWithTooltip';
import { useGetCompaniesQuery, useGetPeopleQuery } from '~/generated/graphql';
import { beautifyExactDate } from '~/utils/date-utils';

import { useCompleteTask } from '../hooks/useCompleteTask';
import { TaskForList } from '../types/TaskForList';

const StyledContainer = styled.div`
  align-items: center;
  align-self: stretch;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  cursor: pointer;
  display: inline-flex;
  height: ${({ theme }) => theme.spacing(12)};
  min-width: calc(100% - ${({ theme }) => theme.spacing(8)});
  padding: 0 ${({ theme }) => theme.spacing(4)};
`;

const StyledTaskBody = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  width: 1px;
`;

const StyledTaskTitle = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: 0 ${({ theme }) => theme.spacing(2)};
`;

const StyledCommentIcon = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.light};
  display: flex;
  margin-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledDueDate = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledFieldsContainer = styled.div`
  display: flex;
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
                .map(
                  (target) => (target.personId || target.commentableId) ?? '',
                )
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
                .map(
                  (target) => (target.companyId || target.commentableId) ?? '',
                )
            : [],
        },
      },
    },
  });
  const body = JSON.parse(task.body ?? '{}')[0]?.content[0]?.text;
  const { completeTask } = useCompleteTask(task);

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
        <Checkbox
          checked={!!task.completedAt}
          shape={CheckboxShape.Rounded}
          onChange={completeTask}
        />
      </div>
      <StyledTaskTitle>{task.title ?? '(No title)'}</StyledTaskTitle>
      <StyledTaskBody>
        <OverflowingTextWithTooltip text={body} />
        {task.comments && task.comments.length > 0 && (
          <StyledCommentIcon>
            <IconComment size={theme.icon.size.md} />
          </StyledCommentIcon>
        )}
      </StyledTaskBody>
      <StyledFieldsContainer>
        <ActivityTargetChips
          targetCompanies={targetCompanies}
          targetPeople={targetPeople}
        />
        <StyledDueDate>
          <IconCalendar size={theme.icon.size.md} />
          {task.dueAt && beautifyExactDate(task.dueAt)}
        </StyledDueDate>
      </StyledFieldsContainer>
    </StyledContainer>
  );
}
