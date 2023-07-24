import React, { useEffect, useMemo, useState } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import styled from '@emotion/styled';

import { ActivityBodyEditor } from '@/activities/components/ActivityBodyEditor';
import { ActivityComments } from '@/activities/components/ActivityComments';
import { ActivityRelationPicker } from '@/activities/components/ActivityRelationPicker';
import { ActivityTypeDropdown } from '@/activities/components/ActivityTypeDropdown';
import { GET_ACTIVITY } from '@/activities/queries';
import { PropertyBox } from '@/ui/editable-field/property-box/components/PropertyBox';
import { PropertyBoxItem } from '@/ui/editable-field/property-box/components/PropertyBoxItem';
import { useIsMobile } from '@/ui/hooks/useIsMobile';
import { IconArrowUpRight } from '@/ui/icon/index';
import {
  useGetActivityQuery,
  useUpdateActivityMutation,
} from '~/generated/graphql';
import { debounce } from '~/utils/debounce';

import { ActivityActionBar } from './ActivityActionBar';

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

const StyledEditableTitleInput = styled.input`
  background: transparent;

  border: none;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  flex: 1 0 0;

  flex-direction: column;
  font-family: Inter;
  font-size: ${({ theme }) => theme.font.size.xl};
  font-style: normal;
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  justify-content: center;

  line-height: ${({ theme }) => theme.text.lineHeight.md};
  outline: none;
  width: calc(100% - ${({ theme }) => theme.spacing(2)});
  &::placeholder {
    color: ${({ theme }) => theme.font.color.light};
  }
`;

const StyledTopActionsContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

type OwnProps = {
  activityId: string;
  showComment?: boolean;
  autoFillTitle?: boolean;
};

export function Activity({
  activityId,
  showComment = true,
  autoFillTitle = false,
}: OwnProps) {
  const { data } = useGetActivityQuery({
    variables: {
      activityId: activityId ?? '',
    },
    skip: !activityId,
  });
  const activity = data?.findManyActivities[0];
  const [hasUserManuallySetTitle, setHasUserManuallySetTitle] =
    useState<boolean>(false);

  const [title, setTitle] = useState<string | null>(null);

  useEffect(() => {
    if (!hasUserManuallySetTitle) {
      setTitle(activity?.title ?? '');
    }
  }, [setTitle, activity?.title, hasUserManuallySetTitle]);

  const [updateActivityMutation] = useUpdateActivityMutation();

  const debounceUpdateTitle = useMemo(() => {
    function updateTitle(title: string) {
      if (activity) {
        updateActivityMutation({
          variables: {
            id: activityId,
            title: title ?? '',
          },
          refetchQueries: [getOperationName(GET_ACTIVITY) ?? ''],
          optimisticResponse: {
            __typename: 'Mutation',
            updateOneActivity: {
              __typename: 'Activity',
              id: activityId,
              title: title,
              type: activity.type,
            },
          },
        });
      }
    }
    return debounce(updateTitle, 200);
  }, [activityId, updateActivityMutation, activity]);

  function updateTitleFromBody(body: string) {
    const parsedTitle = JSON.parse(body)[0]?.content[0]?.text;
    if (!hasUserManuallySetTitle && autoFillTitle) {
      setTitle(parsedTitle);
      debounceUpdateTitle(parsedTitle);
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
          <StyledEditableTitleInput
            autoFocus
            placeholder={`${activity.type} title (optional)`}
            onChange={(event) => {
              setHasUserManuallySetTitle(true);
              setTitle(event.target.value);
              debounceUpdateTitle(event.target.value);
            }}
            value={title ?? ''}
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
