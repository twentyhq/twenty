import { useContext } from 'react';
import { IconArrowUpRight, IconPencil } from 'twenty-ui';

import { ActivityTargetChips } from '@/activities/components/ActivityTargetChips';
import { useActivityTargetObjectRecords } from '@/activities/hooks/useActivityTargetObjectRecords';
import { useOpenActivityTargetInlineCellEditMode } from '@/activities/inline-cell/hooks/useOpenActivityTargetInlineCellEditMode';
import { useUpdateActivityTargetFromInlineCell } from '@/activities/inline-cell/hooks/useUpdateActivityTargetFromInlineCell';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFieldContext } from '@/object-record/hooks/useFieldContext';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { FieldFocusContextProvider } from '@/object-record/record-field/contexts/FieldFocusContextProvider';
import { useIsFieldValueReadOnly } from '@/object-record/record-field/hooks/useIsFieldValueReadOnly';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import { RecordInlineCellContainer } from '@/object-record/record-inline-cell/components/RecordInlineCellContainer';
import { RecordInlineCellContext } from '@/object-record/record-inline-cell/components/RecordInlineCellContext';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import { MultipleRecordPicker } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPicker';
import { MultipleRecordPickerHotkeyScope } from '@/object-record/record-picker/multiple-record-picker/types/MultipleRecordPickerHotkeyScope';

type ActivityTargetsInlineCellProps = {
  activityRecordId: string;
  showLabel?: boolean;
  maxWidth?: number;
  activityObjectNameSingular:
    | CoreObjectNameSingular.Note
    | CoreObjectNameSingular.Task;
  componentInstanceId: string;
};

export const ActivityTargetsInlineCell = ({
  activityRecordId,
  showLabel = true,
  maxWidth,
  activityObjectNameSingular,
  componentInstanceId,
}: ActivityTargetsInlineCellProps) => {
  const { activityTargetObjectRecords } =
    useActivityTargetObjectRecords(activityRecordId);

  const { closeInlineCell } = useInlineCell();

  const { fieldDefinition } = useContext(FieldContext);

  const isFieldReadOnly = useIsFieldValueReadOnly();

  const { FieldContextProvider: ActivityTargetsContextProvider } =
    useFieldContext({
      objectNameSingular: activityObjectNameSingular,
      objectRecordId: activityRecordId,
      fieldMetadataName: fieldDefinition.metadata.fieldName,
      fieldPosition: 3,
      overridenIsFieldEmpty: activityTargetObjectRecords.length === 0,
      recoilScopeId: componentInstanceId,
    });

  const { openActivityTargetInlineCellEditMode } =
    useOpenActivityTargetInlineCellEditMode();

  const { updateActivityTargetFromInlineCell } =
    useUpdateActivityTargetFromInlineCell({
      activityObjectNameSingular,
      activityId: activityRecordId,
    });

  return (
    <RecordFieldComponentInstanceContext.Provider
      value={{
        instanceId: componentInstanceId,
      }}
    >
      <FieldFocusContextProvider>
        {ActivityTargetsContextProvider && (
          <ActivityTargetsContextProvider>
            <RecordInlineCellContext.Provider
              value={{
                buttonIcon: IconPencil,
                customEditHotkeyScope:
                  MultipleRecordPickerHotkeyScope.MultipleRecordPicker,
                IconLabel: showLabel ? IconArrowUpRight : undefined,
                showLabel: showLabel,
                readonly: isFieldReadOnly,
                labelWidth: fieldDefinition?.labelWidth,
                editModeContent: (
                  <MultipleRecordPicker
                    componentInstanceId={componentInstanceId}
                    onClickOutside={() => {
                      closeInlineCell();
                    }}
                    onChange={(morphItem) => {
                      updateActivityTargetFromInlineCell({
                        recordPickerInstanceId: componentInstanceId,
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
                    recordPickerInstanceId: componentInstanceId,
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
    </RecordFieldComponentInstanceContext.Provider>
  );
};
