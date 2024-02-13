import { useRef } from 'react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { ActivityBodyEditor } from '@/activities/components/ActivityBodyEditor';
import { ActivityComments } from '@/activities/components/ActivityComments';
import { ActivityTypeDropdown } from '@/activities/components/ActivityTypeDropdown';
import { useDeleteActivityFromCache } from '@/activities/hooks/useDeleteActivityFromCache';
import { useUpsertActivity } from '@/activities/hooks/useUpsertActivity';
import { ActivityTargetsInlineCell } from '@/activities/inline-cell/components/ActivityTargetsInlineCell';
import { isCreatingActivityState } from '@/activities/states/isCreatingActivityState';
import { Activity } from '@/activities/types/Activity';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFieldContext } from '@/object-record/hooks/useFieldContext';
import {
  RecordUpdateHook,
  RecordUpdateHookParams,
} from '@/object-record/record-field/contexts/FieldContext';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { PropertyBox } from '@/object-record/record-inline-cell/property-box/components/PropertyBox';
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
  justify-content: space-between;
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
  activity: Activity;
  showComment?: boolean;
  fillTitleFromBody?: boolean;
};

export const ActivityEditor = ({
  activity,
  showComment = true,
  fillTitleFromBody = false,
}: ActivityEditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { useRegisterClickOutsideListenerCallback } = useClickOutsideListener(
    RIGHT_DRAWER_CLICK_OUTSIDE_LISTENER_ID,
  );

  const { upsertActivity } = useUpsertActivity();
  const { deleteActivityFromCache } = useDeleteActivityFromCache();

  const useUpsertOneActivityMutation: RecordUpdateHook = () => {
    const upsertActivityMutation = ({ variables }: RecordUpdateHookParams) => {
      upsertActivity({ activity, input: variables.updateOneRecordInput });
    };

    return [upsertActivityMutation, { loading: false }];
  };

  const { FieldContextProvider: DueAtFieldContextProvider } = useFieldContext({
    objectNameSingular: CoreObjectNameSingular.Activity,
    objectRecordId: activity.id,
    fieldMetadataName: 'dueAt',
    fieldPosition: 0,
    clearable: true,
    customUseUpdateOneObjectHook: useUpsertOneActivityMutation,
  });

  const { FieldContextProvider: AssigneeFieldContextProvider } =
    useFieldContext({
      objectNameSingular: CoreObjectNameSingular.Activity,
      objectRecordId: activity.id,
      fieldMetadataName: 'assignee',
      fieldPosition: 1,
      clearable: true,
      customUseUpdateOneObjectHook: useUpsertOneActivityMutation,
    });

  const { FieldContextProvider: ActivityTargetsContextProvider } =
    useFieldContext({
      objectNameSingular: CoreObjectNameSingular.Activity,
      objectRecordId: activity?.id ?? '',
      fieldMetadataName: 'activityTargets',
      fieldPosition: 2,
    });

  const [isCreatingActivity, setIsCreatingActivity] = useRecoilState(
    isCreatingActivityState,
  );

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
          <ActivityTitle activity={activity} />
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
