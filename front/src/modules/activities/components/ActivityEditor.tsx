import React, { useCallback, useState } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import styled from '@emotion/styled';

import { ActivityBodyEditor } from '@/activities/components/ActivityBodyEditor';
import { ActivityComments } from '@/activities/components/ActivityComments';
import { ActivityRelationPicker } from '@/activities/components/ActivityRelationPicker';
import { ActivityTypeDropdown } from '@/activities/components/ActivityTypeDropdown';
import { GET_ACTIVITIES_BY_TARGETS } from '@/activities/queries';
import { PropertyBox } from '@/ui/editable-field/property-box/components/PropertyBox';
import { PropertyBoxItem } from '@/ui/editable-field/property-box/components/PropertyBoxItem';
import { useIsMobile } from '@/ui/hooks/useIsMobile';
import { IconArrowUpRight } from '@/ui/icon/index';
import {
  Activity,
  ActivityTarget,
  useUpdateActivityMutation,
} from '~/generated/graphql';
import { debounce } from '~/utils/debounce';

import { ActivityActionBar } from '../right-drawer/components/ActivityActionBar';
import { CommentForDrawer } from '../types/CommentForDrawer';

import { ActivityTitle } from './ActivityTitle';

import '@blocknote/core/style.css';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
  overflow-y: auto;
`;

const StyledUpperPartContainer = styled.div`
  align-items: flex-start;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  gap: ${({ theme }) => theme.spacing(4)};
  justify-content: flex-start;
`;

const StyledTopContainer = styled.div`
  align-items: flex-start;
  align-self: stretch;
  background: ${({ theme }) => theme.background.secondary};
  border-bottom: ${({ theme }) =>
    useIsMobile() ? 'none' : `1px solid ${theme.border.color.medium}`};
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px 24px 24px 48px;
`;

const StyledTopActionsContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

type OwnProps = {
  activity: Pick<Activity, 'id' | 'title' | 'body' | 'type' | 'completedAt'> & {
    comments?: Array<CommentForDrawer> | null;
  } & {
    activityTargets?: Array<
      Pick<ActivityTarget, 'id' | 'commentableId' | 'commentableType'>
    > | null;
  };
  showComment?: boolean;
  autoFillTitle?: boolean;
};

export function ActivityEditor({
  activity,
  showComment = true,
  autoFillTitle = false,
}: OwnProps) {
  const [hasUserManuallySetTitle, setHasUserManuallySetTitle] =
    useState<boolean>(false);

  const [title, setTitle] = useState<string | null>(activity.title ?? '');
  const [completedAt, setCompletedAt] = useState<string | null>(
    activity.completedAt ?? '',
  );

  const [updateActivityMutation] = useUpdateActivityMutation();

  const updateTitle = useCallback(
    (newTitle: string) => {
      updateActivityMutation({
        variables: {
          id: activity.id,
          title: newTitle ?? '',
        },
        refetchQueries: [getOperationName(GET_ACTIVITIES_BY_TARGETS) ?? ''],
      });
    },
    [activity, updateActivityMutation],
  );

  const handleActivityCompletionChange = useCallback(
    (value: boolean) => {
      updateActivityMutation({
        variables: {
          id: activity.id,
          completedAt: value ? new Date().toISOString() : null,
        },
        refetchQueries: [getOperationName(GET_ACTIVITIES_BY_TARGETS) ?? ''],
      });
      setCompletedAt(value ? new Date().toISOString() : null);
    },
    [activity, updateActivityMutation],
  );

  const debouncedUpdateTitle = debounce(updateTitle, 200);

  function updateTitleFromBody(body: string) {
    const parsedTitle = JSON.parse(body)[0]?.content[0]?.text;
    if (!hasUserManuallySetTitle && autoFillTitle) {
      setTitle(parsedTitle);
      debouncedUpdateTitle(parsedTitle);
    }
  }

  if (!activity) {
    return <></>;
  }

  return (
    <StyledContainer>
      <StyledUpperPartContainer>
        <StyledTopContainer>
          <StyledTopActionsContainer>
            <ActivityTypeDropdown activity={activity} />
            <ActivityActionBar activityId={activity?.id ?? ''} />
          </StyledTopActionsContainer>
          <ActivityTitle
            title={title ?? ''}
            completed={!!completedAt}
            type={activity.type}
            onTitleChange={(newTitle) => {
              setTitle(newTitle);
              setHasUserManuallySetTitle(true);
              debouncedUpdateTitle(newTitle);
            }}
            onCompletionChange={handleActivityCompletionChange}
          />
          <PropertyBox>
            <PropertyBoxItem
              icon={<IconArrowUpRight />}
              value={
                <ActivityRelationPicker
                  activity={{
                    id: activity.id,
                    activityTargets: activity.activityTargets ?? [],
                  }}
                />
              }
              label="Relations"
            />
          </PropertyBox>
        </StyledTopContainer>
        <ActivityBodyEditor
          activity={activity}
          onChange={updateTitleFromBody}
        />
      </StyledUpperPartContainer>
      {showComment && (
        <ActivityComments
          activity={{
            id: activity.id,
            comments: activity.comments ?? [],
          }}
        />
      )}
    </StyledContainer>
  );
}
