import { useRef } from 'react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { ActivityBodyEditor } from '@/activities/components/ActivityBodyEditor';
import { ActivityComments } from '@/activities/components/ActivityComments';
import { ActivityTypeDropdown } from '@/activities/components/ActivityTypeDropdown';
import { useDeleteActivityFromCache } from '@/activities/hooks/useDeleteActivityFromCache';
import { useUpsertActivity } from '@/activities/hooks/useUpsertActivity';
import { ActivityTargetsInlineCell } from '@/activities/inline-cell/components/ActivityTargetsInlineCell';
import { canCreateActivityState } from '@/activities/states/canCreateActivityState';
import { isActivityInCreateModeState } from '@/activities/states/isActivityInCreateModeState';
import { isUpsertingActivityInDBState } from '@/activities/states/isCreatingActivityInDBState';
import { Activity } from '@/activities/types/Activity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFieldContext } from '@/object-record/hooks/useFieldContext';
import {
  RecordUpdateHook,
  RecordUpdateHookParams,
} from '@/object-record/record-field/contexts/FieldContext';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { PropertyBox } from '@/object-record/record-inline-cell/property-box/components/PropertyBox';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { RIGHT_DRAWER_CLICK_OUTSIDE_LISTENER_ID } from '@/ui/layout/right-drawer/constants/RightDrawerClickOutsideListener';
import { useClickOutsideListener } from '@/ui/utilities/pointer-event/hooks/useClickOutsideListener';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';

import { ActivityTitle } from './ActivityTitle';

import '@blocknote/core/style.css';

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledUpperPartContainer = styled.div`
  align-items: flex-start;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

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
  activityId: string;
  showComment?: boolean;
  fillTitleFromBody?: boolean;
};

export const ActivityEditor = ({
  activityId,
  showComment = true,
  fillTitleFromBody = false,
}: ActivityEditorProps) => {
  console.log('ActivityEditor');
  const containerRef = useRef<HTMLDivElement>(null);

  const { useRegisterClickOutsideListenerCallback } = useClickOutsideListener(
    RIGHT_DRAWER_CLICK_OUTSIDE_LISTENER_ID,
  );

  const { upsertActivity } = useUpsertActivity();
  const { deleteActivityFromCache } = useDeleteActivityFromCache();

  const [activityFromStore] = useRecoilState(
    recordStoreFamilyState(activityId),
  );

  const activity = activityFromStore as Activity;

  const useUpsertOneActivityMutation: RecordUpdateHook = () => {
    const upsertActivityMutation = async ({
      variables,
    }: RecordUpdateHookParams) => {
      if (activityFromStore) {
        await upsertActivity({
          activity: activityFromStore as Activity,
          input: variables.updateOneRecordInput,
        });
      }
    };

    return [upsertActivityMutation, { loading: false }];
  };

  const { FieldContextProvider: DueAtFieldContextProvider } = useFieldContext({
    objectNameSingular: CoreObjectNameSingular.Activity,
    objectRecordId: activityId,
    fieldMetadataName: 'dueAt',
    fieldPosition: 0,
    clearable: true,
    customUseUpdateOneObjectHook: useUpsertOneActivityMutation,
  });

  const { FieldContextProvider: AssigneeFieldContextProvider } =
    useFieldContext({
      objectNameSingular: CoreObjectNameSingular.Activity,
      objectRecordId: activityId,
      fieldMetadataName: 'assignee',
      fieldPosition: 1,
      clearable: true,
      customUseUpdateOneObjectHook: useUpsertOneActivityMutation,
    });

  const [isActivityInCreateMode, setIsActivityInCreateMode] = useRecoilState(
    isActivityInCreateModeState,
  );

  const [isUpsertingActivityInDB] = useRecoilState(
    isUpsertingActivityInDBState,
  );

  const [canCreateActivity] = useRecoilState(canCreateActivityState);

  const { FieldContextProvider: ActivityTargetsContextProvider } =
    useFieldContext({
      objectNameSingular: CoreObjectNameSingular.Activity,
      objectRecordId: activityId,
      fieldMetadataName: 'activityTargets',
      fieldPosition: 2,
    });

  // useRegisterClickOutsideListenerCallback({
  //   callbackId: 'activity-editor',
  //   callbackFunction: () => {
  //     if (isUpsertingActivityInDB || !activityFromStore) {
  //       return;
  //     }

  //     if (isActivityInCreateMode) {
  //       if (canCreateActivity) {
  //         upsertActivity({
  //           activity,
  //           input: {
  //             title: activityFromStore.title,
  //             body: activityFromStore.body,
  //           },
  //         });
  //       } else {
  //         deleteActivityFromCache(activity);
  //       }

  //       setIsActivityInCreateMode(false);
  //     } else {
  //       if (
  //         activityFromStore.title !== activity.title ||
  //         activityFromStore.body !== activity.body
  //       ) {
  //         upsertActivity({
  //           activity,
  //           input: {
  //             title: activityFromStore.title,
  //             body: activityFromStore.body,
  //           },
  //         });
  //       }
  //     }
  //   },
  // });

  if (!activityFromStore) {
    return <></>;
  }

  return (
    <StyledContainer ref={containerRef}>
      <StyledUpperPartContainer>
        <StyledTopContainer>
          <ActivityTypeDropdown activity={activity} />
          <ActivityTitle activityId={activityId} />
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
            {ActivityTargetsContextProvider && (
              <ActivityTargetsContextProvider>
                <ActivityTargetsInlineCell activity={activity} />
              </ActivityTargetsContextProvider>
            )}
          </PropertyBox>
        </StyledTopContainer>
      </StyledUpperPartContainer>
      <ActivityBodyEditor
        activity={activity}
        fillTitleFromBody={fillTitleFromBody}
      />
      {showComment && (
        <ActivityComments
          activity={activity}
          scrollableContainerRef={containerRef}
        />
      )}
    </StyledContainer>
  );
};
