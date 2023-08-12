import React, { useCallback, useRef, useState } from 'react';
import { useApolloClient } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';
import styled from '@emotion/styled';

import { ActivityBodyEditor } from '@/activities/components/ActivityBodyEditor';
import { ActivityComments } from '@/activities/components/ActivityComments';
import { ActivityTypeDropdown } from '@/activities/components/ActivityTypeDropdown';
import { GET_ACTIVITIES } from '@/activities/queries';
import { PropertyBox } from '@/ui/editable-field/property-box/components/PropertyBox';
import { DateEditableField } from '@/ui/editable-field/variants/components/DateEditableField';
import { IconCalendar } from '@/ui/icon/index';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import {
  Activity,
  ActivityTarget,
  ActivityType,
  User,
  useUpdateActivityMutation,
} from '~/generated/graphql';
import { debounce } from '~/utils/debounce';

import { ActivityAssigneeEditableField } from '../editable-fields/components/ActivityAssigneeEditableField';
import { ActivityRelationEditableField } from '../editable-fields/components/ActivityRelationEditableField';
import { ACTIVITY_UPDATE_FRAGMENT } from '../queries/update';
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

type OwnProps = {
  activity: Pick<
    Activity,
    'id' | 'title' | 'body' | 'type' | 'completedAt' | 'dueAt'
  > & {
    comments?: Array<CommentForDrawer> | null;
  } & {
    assignee?: Pick<
      User,
      'id' | 'firstName' | 'lastName' | 'displayName'
    > | null;
  } & {
    activityTargets?: Array<Pick<ActivityTarget, 'id'>> | null;
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
  const containerRef = useRef<HTMLDivElement>(null);

  const [updateActivityMutation] = useUpdateActivityMutation();

  const client = useApolloClient();
  const cachedActivity = client.readFragment({
    id: `Activity:${activity.id}`,
    fragment: ACTIVITY_UPDATE_FRAGMENT,
  });

  const updateTitle = useCallback(
    (newTitle: string) => {
      updateActivityMutation({
        variables: {
          where: {
            id: activity.id,
          },
          data: {
            title: newTitle ?? '',
          },
        },
        optimisticResponse: {
          __typename: 'Mutation',
          updateOneActivity: {
            __typename: 'Activity',
            ...cachedActivity,
            title: newTitle,
          },
        },
      });
    },
    [activity.id, cachedActivity, updateActivityMutation],
  );

  const handleActivityCompletionChange = useCallback(
    (value: boolean) => {
      updateActivityMutation({
        variables: {
          where: {
            id: activity.id,
          },
          data: {
            completedAt: value ? new Date().toISOString() : null,
          },
        },
        optimisticResponse: {
          __typename: 'Mutation',
          updateOneActivity: {
            __typename: 'Activity',
            ...cachedActivity,
            completedAt: value ? new Date().toISOString() : null,
          },
        },
        refetchQueries: [getOperationName(GET_ACTIVITIES) ?? ''],
      });
      setCompletedAt(value ? new Date().toISOString() : null);
    },
    [activity.id, cachedActivity, updateActivityMutation],
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
    <StyledContainer ref={containerRef}>
      <StyledUpperPartContainer>
        <StyledTopContainer>
          <ActivityTypeDropdown activity={activity} />
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
            {activity.type === ActivityType.Task && (
              <>
                <DateEditableField
                  value={activity.dueAt}
                  icon={<IconCalendar />}
                  label="Due date"
                  onSubmit={(newDate) => {
                    updateActivityMutation({
                      variables: {
                        where: {
                          id: activity.id,
                        },
                        data: {
                          dueAt: newDate,
                        },
                      },
                      refetchQueries: [getOperationName(GET_ACTIVITIES) ?? ''],
                    });
                  }}
                />
                <ActivityAssigneeEditableField activity={activity} />
              </>
            )}
            <ActivityRelationEditableField activity={activity} />
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
          scrollableContainerRef={containerRef}
        />
      )}
    </StyledContainer>
  );
}
