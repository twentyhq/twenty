import React, { useCallback, useRef, useState } from 'react';
import { useApolloClient } from '@apollo/client';
import { getOperationName } from '@apollo/client/utilities';
import styled from '@emotion/styled';
import debounce from 'lodash.debounce';
import { useRecoilState, useRecoilValue } from 'recoil';

import { ActivityBodyEditor } from '@/activities/components/ActivityBodyEditor';
import { ActivityComments } from '@/activities/components/ActivityComments';
import { ActivityTypeDropdown } from '@/activities/components/ActivityTypeDropdown';
import { GET_ACTIVITIES } from '@/activities/graphql/queries/getActivities';
import { currentUserState } from '@/auth/states/currentUserState';
import { GET_COMPANIES } from '@/companies/graphql/queries/getCompanies';
import { GET_PEOPLE } from '@/people/graphql/queries/getPeople';
import { PropertyBox } from '@/ui/editable-field/property-box/components/PropertyBox';
import { RecoilScope } from '@/ui/utilities/recoil-scope/components/RecoilScope';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import {
  Activity,
  ActivityCreateInput,
  ActivityTarget,
  ActivityType,
  useCreateActivityMutation,
  User,
  useUpdateActivityMutation,
} from '~/generated/graphql';

import { ActivityAssigneeEditableField } from '../editable-fields/components/ActivityAssigneeEditableField';
import { ActivityEditorDateField } from '../editable-fields/components/ActivityEditorDateField';
import { ActivityRelationEditableField } from '../editable-fields/components/ActivityRelationEditableField';
import { ACTIVITY_UPDATE_FRAGMENT } from '../graphql/fragments/activityUpdateFragment';
import { GET_ACTIVITIES_BY_TARGETS } from '../graphql/queries/getActivitiesByTarget';
import { GET_ACTIVITY } from '../graphql/queries/getActivity';
import { activityTargetableEntityArrayState } from '../states/activityTargetableEntityArrayState';
import { currentActivityState } from '../states/currentActivityState';
import { viewableActivityIdState } from '../states/viewableActivityIdState';
import { CommentForDrawer } from '../types/CommentForDrawer';
import { getRelationData } from '../utils/getRelationData';

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
  activity?: Pick<
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

// this hook can be used to create an activity and set other fields (data) at the same time
const useCreateActivity = () => {
  const currentUser = useRecoilValue(currentUserState);
  const currentActivity = useRecoilValue(currentActivityState);
  const [createActivityMutation] = useCreateActivityMutation();

  const [, setViewableActivityId] = useRecoilState(viewableActivityIdState);
  const [, setActivityTargetableEntityArray] = useRecoilState(
    activityTargetableEntityArrayState,
  );

  return (data: Partial<ActivityCreateInput>) => {
    const now = new Date().toISOString();

    return createActivityMutation({
      variables: {
        data: {
          id: currentActivity?.id,
          createdAt: now,
          updatedAt: now,
          author: { connect: { id: currentUser?.id ?? '' } },
          workspaceMemberAuthor: {
            connect: { id: currentUser?.workspaceMember?.id ?? '' },
          },
          workspaceMemberAssignee: {
            connect: { id: currentUser?.workspaceMember?.id ?? '' },
          },
          activityTargets: {
            createMany: {
              data: currentActivity?.targetableEntities
                ? getRelationData(currentActivity.targetableEntities)
                : [],
              skipDuplicates: true,
            },
          },
          type: currentActivity?.type,
          assignee: currentActivity?.assignee,
          ...data,
        },
      },
      refetchQueries: [
        getOperationName(GET_COMPANIES) ?? '',
        getOperationName(GET_PEOPLE) ?? '',
        getOperationName(GET_ACTIVITY) ?? '',
        getOperationName(GET_ACTIVITIES_BY_TARGETS) ?? '',
        getOperationName(GET_ACTIVITIES) ?? '',
      ],
      onCompleted: (data) => {
        setViewableActivityId(data.createOneActivity.id);
        setActivityTargetableEntityArray(
          currentActivity?.targetableEntities ?? [],
        );
      },
    });
  };
};

export const ActivityEditor = ({
  activity,
  showComment = true,
  autoFillTitle = false,
}: OwnProps) => {
  const [hasUserManuallySetTitle, setHasUserManuallySetTitle] =
    useState<boolean>(false);

  const [title, setTitle] = useState<string | null>(activity?.title ?? '');
  const [completedAt, setCompletedAt] = useState<string | null>(
    activity?.completedAt ?? '',
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const [updateActivityMutation] = useUpdateActivityMutation();

  const client = useApolloClient();
  const cachedActivity = client.readFragment({
    id: `Activity:${activity?.id}`,
    fragment: ACTIVITY_UPDATE_FRAGMENT,
  });

  const currentActivity = useRecoilValue(currentActivityState);
  const createActivity = useCreateActivity();

  const updateTitle = useCallback(
    async (newTitle: string) => {
      if (!activity?.id) await createActivity({ title: newTitle ?? '' });

      if (activity?.id) {
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
          refetchQueries: [getOperationName(GET_ACTIVITIES) ?? ''],
        });
      }
    },
    [activity?.id, cachedActivity, createActivity, updateActivityMutation],
  );

  const handleActivityCompletionChange = useCallback(
    (value: boolean) => {
      if (activity?.id)
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
    [activity?.id, cachedActivity, updateActivityMutation],
  );

  const debouncedUpdateTitle = debounce(updateTitle, 200);

  const updateTitleFromBody = (body: string) => {
    const parsedTitle = JSON.parse(body)[0]?.content[0]?.text;
    if (!hasUserManuallySetTitle && autoFillTitle) {
      setTitle(parsedTitle);
      debouncedUpdateTitle(parsedTitle);
    }
  };

  // How about we define the acivity but with no ID?
  // So, we can maybe have an if(!activity.id) meaning, activity is not yet in the DB?
  if (!activity && !currentActivity) {
    return <></>;
  }

  const type = (activity?.type ?? currentActivity?.type) as ActivityType;

  return (
    <StyledContainer ref={containerRef}>
      <StyledUpperPartContainer>
        <StyledTopContainer>
          <ActivityTypeDropdown activity={{ type }} />
          <ActivityTitle
            title={title ?? ''}
            completed={!!completedAt}
            type={type}
            onTitleChange={(newTitle) => {
              setTitle(newTitle);
              setHasUserManuallySetTitle(true);
              debouncedUpdateTitle(newTitle);
            }}
            onCompletionChange={handleActivityCompletionChange}
          />
          <PropertyBox>
            {type === ActivityType.Task && activity?.id && (
              <>
                <RecoilScope>
                  <ActivityEditorDateField activityId={activity.id} />
                </RecoilScope>
                <RecoilScope>
                  <ActivityAssigneeEditableField activity={activity} />
                </RecoilScope>
              </>
            )}
            <ActivityRelationEditableField activity={activity} />
          </PropertyBox>
        </StyledTopContainer>
        <ActivityBodyEditor
          activity={{ body: activity?.body, id: activity?.id }}
          onChange={updateTitleFromBody}
        />
      </StyledUpperPartContainer>
      {showComment && activity?.id && (
        <ActivityComments
          activity={{
            id: activity.id,
            comments: activity?.comments ?? [],
          }}
          scrollableContainerRef={containerRef}
        />
      )}
    </StyledContainer>
  );
};
