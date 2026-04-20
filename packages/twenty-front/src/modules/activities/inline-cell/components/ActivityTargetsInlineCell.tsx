import { t } from '@lingui/core/macro';
import { useCallback, useContext, useState } from 'react';

import { ActivityTargetChips } from '@/activities/components/ActivityTargetChips';
import { useActivityTargetObjectRecords } from '@/activities/hooks/useActivityTargetObjectRecords';
import { useOpenActivityTargetCellEditMode } from '@/activities/inline-cell/hooks/useOpenActivityTargetCellEditMode';
import { useUpdateActivityTargetFromCell } from '@/activities/inline-cell/hooks/useUpdateActivityTargetFromCell';
import { type CoreObjectNameSingular } from 'twenty-shared/types';
import { RecordFieldsScopeContextProvider } from '@/object-record/record-field-list/contexts/RecordFieldsScopeContext';
import { FieldContextProvider } from '@/object-record/record-field/ui/components/FieldContextProvider';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { FieldFocusContextProvider } from '@/object-record/record-field/ui/contexts/FieldFocusContextProvider';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { RecordInlineCellContainer } from '@/object-record/record-inline-cell/components/RecordInlineCellContainer';
import { RecordInlineCellContext } from '@/object-record/record-inline-cell/components/RecordInlineCellContext';
import { RecordInlineCellEditMode } from '@/object-record/record-inline-cell/components/RecordInlineCellEditMode';
import { MultipleRecordPicker } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPicker';
import { useGoBackToPreviousDropdownFocusId } from '@/ui/layout/dropdown/hooks/useGoBackToPreviousDropdownFocusId';
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

  const [isRelationPickerOpen, setIsRelationPickerOpen] = useState(false);

  const { goBackToPreviousDropdownFocusId } =
    useGoBackToPreviousDropdownFocusId();

  const handleOpenRelationPicker = useCallback(() => {
    openActivityTargetCellEditMode({
      recordPickerInstanceId: componentInstanceId,
      activityTargetObjectRecords,
    });
    setIsRelationPickerOpen(true);
  }, [
    activityTargetObjectRecords,
    componentInstanceId,
    openActivityTargetCellEditMode,
  ]);

  const handleCloseRelationPicker = useCallback(() => {
    setIsRelationPickerOpen(false);
    goBackToPreviousDropdownFocusId();
  }, [goBackToPreviousDropdownFocusId]);

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
                label: t`Relations`,
                displayModeContent: (
                  <ActivityTargetChips
                    activityTargetObjectRecords={activityTargetObjectRecords}
                    maxWidth={maxWidth}
                  />
                ),
                onOpenEditMode: handleOpenRelationPicker,
                onCloseEditMode: handleCloseRelationPicker,
              }}
            >
              <RecordInlineCellContainer />
              {isRelationPickerOpen && (
                <RecordInlineCellEditMode>
                  <MultipleRecordPicker
                    focusId={componentInstanceId}
                    componentInstanceId={componentInstanceId}
                    onClickOutside={handleCloseRelationPicker}
                    onChange={(morphItem) => {
                      updateActivityTargetFromCell({
                        recordPickerInstanceId: componentInstanceId,
                        morphItem,
                        activityTargetWithTargetRecords:
                          activityTargetObjectRecords,
                      });
                    }}
                    onSubmit={handleCloseRelationPicker}
                  />
                </RecordInlineCellEditMode>
              )}
            </RecordInlineCellContext.Provider>
          </FieldContextProvider>
        </FieldFocusContextProvider>
      </RecordFieldComponentInstanceContext.Provider>
    </RecordFieldsScopeContextProvider>
  );
};
