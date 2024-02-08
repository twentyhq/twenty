import { useCallback, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { ActivityBodyEditor } from '@/activities/components/ActivityBodyEditor';
import { ActivityComments } from '@/activities/components/ActivityComments';
import { ActivityTypeDropdown } from '@/activities/components/ActivityTypeDropdown';
import { useCreateActivityInDB } from '@/activities/hooks/useCreateActivityInDB';
import { useDeleteActivityFromCache } from '@/activities/hooks/useDeleteActivityFromCache';
import { ActivityTargetsInlineCell } from '@/activities/inline-cell/components/ActivityTargetsInlineCell';
import { isCreatingActivityState } from '@/activities/states/isCreatingActivityState';
import { Activity } from '@/activities/types/Activity';
import { ActivityForEditor } from '@/activities/types/ActivityForEditor';
import { GraphQLActivity } from '@/activities/types/GraphQLActivity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFieldContext } from '@/object-record/hooks/useFieldContext';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { PropertyBox } from '@/object-record/record-inline-cell/property-box/components/PropertyBox';
import { RIGHT_DRAWER_CLICK_OUTSIDE_LISTENER_ID } from '@/ui/layout/right-drawer/constants/RightDrawerClickOutsideListener';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
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
  activity: ActivityForEditor;
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

  const { useRegisterClickOutsideListenerCallback } = useClickOutsideListener(
    RIGHT_DRAWER_CLICK_OUTSIDE_LISTENER_ID,
  );

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

  const [isCreatingActivity, setIsCreatingActivity] = useRecoilState(
    isCreatingActivityState,
  );

  const { createActivity } = useCreateActivityInDB();

  const updateTitle = (newTitle: string) => {
    if (isCreatingActivity) {
      createActivity({
        ...activity,
        title: newTitle ?? '',
      });

      setIsCreatingActivity(false);
    } else {
      updateOneActivity?.({
        idToUpdate: activity.id,
        updateOneRecordInput: {
          title: newTitle ?? '',
        },
      });
    }
  };

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

  // TODO: remove
  const { deleteActivityFromCache } = useDeleteActivityFromCache();

  useRegisterClickOutsideListenerCallback({
    callbackId: 'activity-editor',
    callbackFunction: () => {
      if (isCreatingActivity) {
        setIsCreatingActivity(false);
        deleteActivityFromCache(activity);
      }
    },
  });

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
