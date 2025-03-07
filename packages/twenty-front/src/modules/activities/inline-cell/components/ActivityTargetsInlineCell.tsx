import { useContext } from 'react';
import { Key } from 'ts-key-enum';
import { IconArrowUpRight, IconPencil } from 'twenty-ui';

import { ActivityTargetChips } from '@/activities/components/ActivityTargetChips';
import { useActivityTargetObjectRecords } from '@/activities/hooks/useActivityTargetObjectRecords';
import { ActivityTargetInlineCellEditMode } from '@/activities/inline-cell/components/ActivityTargetInlineCellEditMode';
import { useOpenActivityTargetInlineCellEditMode } from '@/activities/inline-cell/hooks/useOpenActivityTargetInlineCellEditMode';
import { ActivityTargetInlineCellComponentInstanceContext } from '@/activities/inline-cell/states/contexts/ActivityTargetInlineCellComponentInstanceContext';
import { getActivityTargetsInlineCellComponentInstanceIdFromActivityId } from '@/activities/inline-cell/utils/getActivityTargetsInlineCellComponentInstanceIdFromActivityId';
import { ActivityEditorHotkeyScope } from '@/activities/types/ActivityEditorHotkeyScope';
import { Note } from '@/activities/types/Note';
import { Task } from '@/activities/types/Task';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFieldContext } from '@/object-record/hooks/useFieldContext';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { FieldFocusContextProvider } from '@/object-record/record-field/contexts/FieldFocusContextProvider';
import { RecordFieldInputScope } from '@/object-record/record-field/scopes/RecordFieldInputScope';
import { RecordInlineCellContainer } from '@/object-record/record-inline-cell/components/RecordInlineCellContainer';
import { RecordInlineCellContext } from '@/object-record/record-inline-cell/components/RecordInlineCellContext';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';

type ActivityTargetsInlineCellProps = {
  activity: Task | Note;
  showLabel?: boolean;
  maxWidth?: number;
  readonly?: boolean;
  activityObjectNameSingular:
    | CoreObjectNameSingular.Note
    | CoreObjectNameSingular.Task;
};

export const ActivityTargetsInlineCell = ({
  activity,
  showLabel = true,
  maxWidth,
  readonly,
  activityObjectNameSingular,
}: ActivityTargetsInlineCellProps) => {
  const { activityTargetObjectRecords } =
    useActivityTargetObjectRecords(activity);

  const { closeInlineCell } = useInlineCell();

  const { fieldDefinition } = useContext(FieldContext);

  useScopedHotkeys(
    Key.Escape,
    () => {
      closeInlineCell();
    },
    ActivityEditorHotkeyScope.ActivityTargets,
  );

  const { FieldContextProvider: ActivityTargetsContextProvider } =
    useFieldContext({
      objectNameSingular: activityObjectNameSingular,
      objectRecordId: activity.id,
      fieldMetadataName: fieldDefinition.metadata.fieldName,
      fieldPosition: 3,
      overridenIsFieldEmpty: activityTargetObjectRecords.length === 0,
    });

  const { openActivityTargetInlineCellEditMode } =
    useOpenActivityTargetInlineCellEditMode();

  return (
    <ActivityTargetInlineCellComponentInstanceContext.Provider
      value={{
        instanceId:
          getActivityTargetsInlineCellComponentInstanceIdFromActivityId(
            activity.id,
          ),
      }}
    >
      <RecordFieldInputScope recordFieldInputScopeId={activity?.id ?? ''}>
        <FieldFocusContextProvider>
          {ActivityTargetsContextProvider && (
            <ActivityTargetsContextProvider>
              <RecordInlineCellContext.Provider
                value={{
                  buttonIcon: IconPencil,
                  customEditHotkeyScope:
                    ActivityEditorHotkeyScope.ActivityTargets,
                  IconLabel: showLabel ? IconArrowUpRight : undefined,
                  showLabel: showLabel,
                  readonly: readonly,
                  labelWidth: fieldDefinition?.labelWidth,
                  editModeContent: (
                    <ActivityTargetInlineCellEditMode
                      activity={activity}
                      activityTargetWithTargetRecords={
                        activityTargetObjectRecords
                      }
                      activityObjectNameSingular={activityObjectNameSingular}
                    />
                  ),
                  label: 'Relations',
                  displayModeContent: (
                    <ActivityTargetChips
                      activityTargetObjectRecords={activityTargetObjectRecords}
                      maxWidth={maxWidth}
                    />
                  ),
                  onOpenEditMode: () => {
                    openActivityTargetInlineCellEditMode({
                      componentInstanceId:
                        getActivityTargetsInlineCellComponentInstanceIdFromActivityId(
                          activity.id,
                        ),
                    });
                  },
                }}
              >
                <RecordInlineCellContainer />
              </RecordInlineCellContext.Provider>
            </ActivityTargetsContextProvider>
          )}
        </FieldFocusContextProvider>
      </RecordFieldInputScope>
    </ActivityTargetInlineCellComponentInstanceContext.Provider>
  );
};
