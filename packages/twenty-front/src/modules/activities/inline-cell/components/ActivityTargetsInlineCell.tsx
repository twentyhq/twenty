import { useContext } from 'react';

import { ActivityTargetChips } from '@/activities/components/ActivityTargetChips';
import { useActivityTargetObjectRecords } from '@/activities/hooks/useActivityTargetObjectRecords';
import { useOpenActivityTargetCellEditMode } from '@/activities/inline-cell/hooks/useOpenActivityTargetCellEditMode';
import { useUpdateActivityTargetFromCell } from '@/activities/inline-cell/hooks/useUpdateActivityTargetFromCell';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { FieldContextProvider } from '@/object-record/record-field/components/FieldContextProvider';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { FieldFocusContextProvider } from '@/object-record/record-field/contexts/FieldFocusContextProvider';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import { RecordInlineCellContainer } from '@/object-record/record-inline-cell/components/RecordInlineCellContainer';
import { RecordInlineCellContext } from '@/object-record/record-inline-cell/components/RecordInlineCellContext';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import { MultipleRecordPicker } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPicker';
import { IconArrowUpRight, IconPencil } from 'twenty-ui/display';

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

  const { closeInlineCell } = useInlineCell(componentInstanceId);

  const { fieldDefinition, isReadOnly } = useContext(FieldContext);

  const { openActivityTargetCellEditMode } =
    useOpenActivityTargetCellEditMode();

  const { updateActivityTargetFromCell } = useUpdateActivityTargetFromCell({
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
        <FieldContextProvider
          objectNameSingular={activityObjectNameSingular}
          objectRecordId={activityRecordId}
          fieldMetadataName={fieldDefinition.metadata.fieldName}
          fieldPosition={3}
          overridenIsFieldEmpty={activityTargetObjectRecords.length === 0}
        >
          <RecordInlineCellContext.Provider
            value={{
              buttonIcon: IconPencil,
              IconLabel: showLabel ? IconArrowUpRight : undefined,
              showLabel: showLabel,
              readonly: isReadOnly,
              labelWidth: fieldDefinition?.labelWidth,
              editModeContent: (
                <MultipleRecordPicker
                  componentInstanceId={componentInstanceId}
                  onClickOutside={() => {
                    closeInlineCell();
                  }}
                  onChange={(morphItem) => {
                    updateActivityTargetFromCell({
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
                openActivityTargetCellEditMode({
                  recordPickerInstanceId: componentInstanceId,
                  activityTargetObjectRecords,
                });
              },
            }}
          >
            <RecordInlineCellContainer />
          </RecordInlineCellContext.Provider>
        </FieldContextProvider>
      </FieldFocusContextProvider>
    </RecordFieldComponentInstanceContext.Provider>
  );
};
