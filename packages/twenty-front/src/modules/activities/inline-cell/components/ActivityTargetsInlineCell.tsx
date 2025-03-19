import { useContext } from 'react';
import { Key } from 'ts-key-enum';
import { IconArrowUpRight, IconPencil } from 'twenty-ui';

import { ActivityTargetChips } from '@/activities/components/ActivityTargetChips';
import { useActivityTargetObjectRecords } from '@/activities/hooks/useActivityTargetObjectRecords';
import { useOpenActivityTargetInlineCellEditMode } from '@/activities/inline-cell/hooks/useOpenActivityTargetInlineCellEditMode';
import { useUpdateActivityTargetFromInlineCell } from '@/activities/inline-cell/hooks/useUpdateActivityTargetFromInlineCell';
import { ActivityEditorHotkeyScope } from '@/activities/types/ActivityEditorHotkeyScope';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFieldContext } from '@/object-record/hooks/useFieldContext';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { FieldFocusContextProvider } from '@/object-record/record-field/contexts/FieldFocusContextProvider';
import { useIsFieldValueReadOnly } from '@/object-record/record-field/hooks/useIsFieldValueReadOnly';
import { RecordFieldInputScope } from '@/object-record/record-field/scopes/RecordFieldInputScope';
import { RecordInlineCellContainer } from '@/object-record/record-inline-cell/components/RecordInlineCellContainer';
import { RecordInlineCellContext } from '@/object-record/record-inline-cell/components/RecordInlineCellContext';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import { MultipleRecordPicker } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPicker';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';

type ActivityTargetsInlineCellProps = {
  activityRecordId: string;
  showLabel?: boolean;
  maxWidth?: number;
  activityObjectNameSingular:
    | CoreObjectNameSingular.Note
    | CoreObjectNameSingular.Task;
};

export const ActivityTargetsInlineCell = ({
  activityRecordId,
  showLabel = true,
  maxWidth,
  activityObjectNameSingular,
}: ActivityTargetsInlineCellProps) => {
  const { activityTargetObjectRecords } =
    useActivityTargetObjectRecords(activityRecordId);

  const multipleRecordPickerInstanceId = `multiple-record-picker-target-${activityRecordId}`;

  const { closeInlineCell } = useInlineCell();

  const { fieldDefinition } = useContext(FieldContext);

  const isFieldReadOnly = useIsFieldValueReadOnly();

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
      objectRecordId: activityRecordId,
      fieldMetadataName: fieldDefinition.metadata.fieldName,
      fieldPosition: 3,
      overridenIsFieldEmpty: activityTargetObjectRecords.length === 0,
    });

  const { openActivityTargetInlineCellEditMode } =
    useOpenActivityTargetInlineCellEditMode();

  const { updateActivityTargetFromInlineCell } =
    useUpdateActivityTargetFromInlineCell({
      activityObjectNameSingular,
      activityId: activityRecordId,
    });

  return (
    <RecordFieldInputScope recordFieldInputScopeId={activityRecordId}>
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
                readonly: isFieldReadOnly,
                labelWidth: fieldDefinition?.labelWidth,
                editModeContent: (
                  <MultipleRecordPicker
                    componentInstanceId={multipleRecordPickerInstanceId}
                    onClickOutside={() => {
                      closeInlineCell();
                    }}
                    onChange={(morphItem) => {
                      updateActivityTargetFromInlineCell({
                        recordPickerInstanceId: multipleRecordPickerInstanceId,
                        morphItem,
                        activityTargetWithTargetRecords:
                          activityTargetObjectRecords,
                      });
                    }}
                    onSubmit={() => {
                      closeInlineCell();
                    }}
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
                    recordPickerInstanceId: multipleRecordPickerInstanceId,
                    activityTargetObjectRecords,
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
  );
};
