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
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFieldContext } from '@/object-record/hooks/useFieldContext';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { PropertyBox } from '@/object-record/record-inline-cell/property-box/components/PropertyBox';
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

  const containerRef = useRef<HTMLDivElement>(null);
  const { updateOneRecord: updateOneActivity } = useUpdateOneRecord<Activity>({
    objectNameSingular: CoreObjectNameSingular.Activity,
  });

  const { FieldContextProvider: DueAtFieldContextProvider } = useFieldContext({
    objectNameSingular: CoreObjectNameSingular.Activity,
    objectRecordId: activity.id,
    fieldMetadataName: 'dueAt',
    fieldPosition: 0,
    clearable: true,
  });

  const { FieldContextProvider: AssigneeFieldContextProvider } =
    useFieldContext({
      objectNameSingular: CoreObjectNameSingular.Activity,
      objectRecordId: activity.id,
      fieldMetadataName: 'assignee',
      fieldPosition: 1,
      clearable: true,
    });

  const updateTitle = useCallback(
    (newTitle: string) => {
      updateOneActivity?.({
        idToUpdate: activity.id,
        updateOneRecordInput: {
          title: newTitle ?? '',
        },
      });
    },
    [activity.id, updateOneActivity],
  );
  const handleActivityCompletionChange = useCallback(
    (value: boolean) => {
      updateOneActivity?.({
        idToUpdate: activity.id,
        updateOneRecordInput: {
          completedAt: value ? new Date().toISOString() : null,
        },
      });
    },
    [activity.id, updateOneActivity],
  );

  const debouncedUpdateTitle = debounce(updateTitle, 200);

  const updateTitleFromBody = (body: string) => {
    const blockBody = JSON.parse(body);
    const parsedTitle = blockBody[0]?.content?.[0]?.text;
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
            completed={!!activity.completedAt}
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
