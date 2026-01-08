import { t } from '@lingui/core/macro';
import { useContext } from 'react';

import { ActivityTargetChips } from '@/activities/components/ActivityTargetChips';
import { useActivityTargetObjectRecords } from '@/activities/hooks/useActivityTargetObjectRecords';
import { useOpenActivityTargetCellEditMode } from '@/activities/inline-cell/hooks/useOpenActivityTargetCellEditMode';
import { useUpdateActivityTargetFromCell } from '@/activities/inline-cell/hooks/useUpdateActivityTargetFromCell';
import { type CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordFieldsScopeContextProvider } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import { FieldContextProvider } from '@/object-record/record-field/ui/components/FieldContextProvider';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { FieldFocusContextProvider } from '@/object-record/record-field/ui/contexts/FieldFocusContextProvider';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
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

  const {
    fieldDefinition,
    isRecordFieldReadOnly: isReadOnly,
    anchorId,
    onMouseEnter,
  } = useContext(FieldContext);

  const { openActivityTargetCellEditMode } =
    useOpenActivityTargetCellEditMode();

  const { updateActivityTargetFromCell } = useUpdateActivityTargetFromCell({
    activityObjectNameSingular,
    activityId: activityRecordId,
  });

  return (
    <RecordFieldsScopeContextProvider
      value={{ scopeInstanceId: componentInstanceId }}
    >
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
            onMouseEnter={onMouseEnter}
            anchorId={anchorId}
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
                    focusId={componentInstanceId}
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
                label: t`Relations`,
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
    </RecordFieldsScopeContextProvider>
  );
};
