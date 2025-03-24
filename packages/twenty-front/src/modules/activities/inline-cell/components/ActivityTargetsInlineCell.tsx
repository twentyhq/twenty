import { useContext } from 'react';
import { IconArrowUpRight, IconPencil } from 'twenty-ui';

import { ActivityTargetChips } from '@/activities/components/ActivityTargetChips';
import { useActivityTargetObjectRecords } from '@/activities/hooks/useActivityTargetObjectRecords';
import { useOpenActivityTargetInlineCellEditMode } from '@/activities/inline-cell/hooks/useOpenActivityTargetInlineCellEditMode';
import { useUpdateActivityTargetFromInlineCell } from '@/activities/inline-cell/hooks/useUpdateActivityTargetFromInlineCell';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import {
  FieldContext,
  RecordUpdateHook,
  RecordUpdateHookParams,
} from '@/object-record/record-field/contexts/FieldContext';
import { FieldFocusContextProvider } from '@/object-record/record-field/contexts/FieldFocusContextProvider';
import { useIsFieldValueReadOnly } from '@/object-record/record-field/hooks/useIsFieldValueReadOnly';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/states/contexts/RecordFieldComponentInstanceContext';
import { RecordInlineCellContainer } from '@/object-record/record-inline-cell/components/RecordInlineCellContainer';
import { RecordInlineCellContext } from '@/object-record/record-inline-cell/components/RecordInlineCellContext';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import { InlineCellHotkeyScope } from '@/object-record/record-inline-cell/types/InlineCellHotkeyScope';
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

  const { closeInlineCell } = useInlineCell(componentInstanceId);

  const { fieldDefinition } = useContext(FieldContext);

  const isFieldReadOnly = useIsFieldValueReadOnly();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: activityObjectNameSingular,
  });

  const fieldMetadataItem = objectMetadataItem?.fields.find(
    (field) => field.name === fieldDefinition.metadata.fieldName,
  );

  const { openActivityTargetInlineCellEditMode } =
    useOpenActivityTargetInlineCellEditMode();

  const { updateActivityTargetFromInlineCell } =
    useUpdateActivityTargetFromInlineCell({
      activityObjectNameSingular,
      activityId: activityRecordId,
    });

  if (!fieldMetadataItem) {
    return null;
  }

  const useUpdateOneObjectMutation: RecordUpdateHook = () => {
    const { updateOneRecord } = useUpdateOneRecord({
      objectNameSingular: activityObjectNameSingular,
    });

    const updateEntity = ({ variables }: RecordUpdateHookParams) => {
      updateOneRecord?.({
        idToUpdate: variables.where.id as string,
        updateOneRecordInput: variables.updateOneRecordInput,
      });
    };

    return [updateEntity, { loading: false }];
  };

  return (
    <RecordFieldComponentInstanceContext.Provider
      value={{
        instanceId: componentInstanceId,
      }}
    >
      <FieldFocusContextProvider>
        <FieldContext.Provider
          key={activityRecordId + fieldDefinition.metadata.fieldName}
          value={{
            recordId: activityRecordId,
            isLabelIdentifier: false,
            fieldDefinition: formatFieldMetadataItemAsColumnDefinition({
              field: fieldMetadataItem,
              showLabel: true,
              position: 3,
              objectMetadataItem,
              labelWidth: 90,
            }),
            useUpdateRecord: useUpdateOneObjectMutation,
            hotkeyScope: InlineCellHotkeyScope.InlineCell,
            clearable: false,
            overridenIsFieldEmpty: activityTargetObjectRecords.length === 0,
          }}
        >
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
        </FieldContext.Provider>
      </FieldFocusContextProvider>
    </RecordFieldComponentInstanceContext.Provider>
  );
};
