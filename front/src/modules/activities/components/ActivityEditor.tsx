import React, { useCallback, useRef, useState } from 'react';
import styled from '@emotion/styled';

import { ActivityBodyEditor } from '@/activities/components/ActivityBodyEditor';
import { ActivityComments } from '@/activities/components/ActivityComments';
import { ActivityTypeDropdown } from '@/activities/components/ActivityTypeDropdown';
import { ActivityTargetsInlineCell } from '@/activities/inline-cell/components/ActivityTargetsInlineCell';
import { Activity } from '@/activities/types/Activity';
import { ActivityTarget } from '@/activities/types/ActivityTarget';
import { Comment } from '@/activities/types/Comment';
import { GraphQLActivity } from '@/activities/types/GraphQLActivity';
import { useFieldContext } from '@/object-record/hooks/useFieldContext';
import { useUpdateOneObjectRecord } from '@/object-record/hooks/useUpdateOneObjectRecord';
import { RecordInlineCell } from '@/ui/object/record-inline-cell/components/RecordInlineCell';
import { PropertyBox } from '@/ui/object/record-inline-cell/property-box/components/PropertyBox';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { debounce } from '~/utils/debounce';

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

type ActivityEditorProps = {
  activity: Pick<
    Activity,
    'id' | 'title' | 'body' | 'type' | 'completedAt' | 'dueAt'
  > & {
    comments?: Array<Comment> | null;
  } & {
    assignee?: Pick<WorkspaceMember, 'id' | 'name' | 'avatarUrl'> | null;
  } & {
    activityTargets?: Array<
      Pick<ActivityTarget, 'id' | 'companyId' | 'personId'>
    > | null;
  };
  showComment?: boolean;
  autoFillTitle?: boolean;
};

export const ActivityEditor = ({
  activity,
  showComment = true,
  autoFillTitle = false,
}: ActivityEditorProps) => {
  const [hasUserManuallySetTitle, setHasUserManuallySetTitle] =
    useState<boolean>(false);

  const [title, setTitle] = useState<string | null>(activity.title ?? '');
  const [completedAt, setCompletedAt] = useState<string | null>(
    activity.completedAt ?? '',
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const { updateOneObject } = useUpdateOneObjectRecord<Activity>({
    objectNameSingular: 'activity',
  });

  const { FieldContextProvider: DueAtFieldContextProvider } = useFieldContext({
    objectNameSingular: 'activity',
    objectRecordId: activity.id,
    fieldMetadataName: 'dueAt',
    fieldPosition: 0,
  });

  const { FieldContextProvider: AssigneeFieldContextProvider } =
    useFieldContext({
      objectNameSingular: 'activity',
      objectRecordId: activity.id,
      fieldMetadataName: 'assignee',
      fieldPosition: 1,
    });

  const updateTitle = useCallback(
    (newTitle: string) => {
      updateOneObject?.({
        idToUpdate: activity.id,
        input: {
          title: newTitle ?? '',
        },
      });
    },
    [activity.id, updateOneObject],
  );
  const handleActivityCompletionChange = useCallback(
    (value: boolean) => {
      updateOneObject?.({
        idToUpdate: activity.id,
        input: {
          completedAt: value ? new Date().toISOString() : null,
        },
      });
      setCompletedAt(value ? new Date().toISOString() : null);
    },
    [activity.id, updateOneObject],
  );

  const debouncedUpdateTitle = debounce(updateTitle, 200);

  const updateTitleFromBody = (body: string) => {
    const parsedTitle = JSON.parse(body)[0]?.content[0]?.text;
    if (!hasUserManuallySetTitle && autoFillTitle) {
      setTitle(parsedTitle);
      debouncedUpdateTitle(parsedTitle);
    }
  };

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
            {activity.type === 'Task' &&
              DueAtFieldContextProvider &&
              AssigneeFieldContextProvider && (
                <>
                  <DueAtFieldContextProvider>
                    <RecordInlineCell />
                  </DueAtFieldContextProvider>
                  <AssigneeFieldContextProvider>
                    <RecordInlineCell />
                  </AssigneeFieldContextProvider>
                </>
              )}
            <ActivityTargetsInlineCell
              activity={activity as unknown as GraphQLActivity}
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
          activity={activity}
          scrollableContainerRef={containerRef}
        />
      )}
    </StyledContainer>
  );
};
