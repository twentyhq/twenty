import { useOpenFormMultiRecordPicker } from '@/object-record/record-field/ui/form-types/hooks/useOpenFormMultiRecordPicker';
import { MultipleRecordPicker } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPicker';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { CONDITION_BUILDER_DROPDOWN_SIDE_OFFSET } from '@/ui/layout/condition-builder/constants/ConditionBuilderDropdownSideOffset';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { type ReactNode } from 'react';
import { isValidUuid } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';

type ConditionalAvailabilityRecordMultipleSelectProps = {
  dropdownId: string;
  objectNameSingular: string;
  control: ReactNode;
  values: string[];
  selectedRecords: ObjectRecord[];
  onChange: (values: string[]) => void;
};

export const ConditionalAvailabilityRecordMultipleSelect = ({
  dropdownId,
  objectNameSingular,
  control,
  values,
  selectedRecords,
  onChange,
}: ConditionalAvailabilityRecordMultipleSelectProps) => {
  const { openFormMultiRecordPicker } = useOpenFormMultiRecordPicker({
    objectNameSingular,
  });

  const handleMorphItemChange = (morphItem: RecordPickerPickableMorphItem) => {
    const valuesWithoutRecord = values.filter(
      (value) => value !== morphItem.recordId,
    );

    onChange(
      morphItem.isSelected
        ? [...valuesWithoutRecord, morphItem.recordId]
        : valuesWithoutRecord,
    );
  };

  return (
    <DropdownRoot
      dropdownId={dropdownId}
      type="picker"
      multiple
      onOpenChange={(isOpen) => {
        if (isOpen) {
          openFormMultiRecordPicker({
            pickerInstanceId: dropdownId,
            selectedRecordIds: values.filter((value) => isValidUuid(value)),
            selectedRecords,
          });
        }
      }}
    >
      <Dropdown.Trigger nativeButton={false} render={<div />}>
        {control}
      </Dropdown.Trigger>
      <DropdownContent
        width="var(--anchor-width)"
        align="start"
        sideOffset={CONDITION_BUILDER_DROPDOWN_SIDE_OFFSET}
      >
        <MultipleRecordPicker
          componentInstanceId={dropdownId}
          onChange={handleMorphItemChange}
          layoutDirection="search-bar-on-top"
        />
      </DropdownContent>
    </DropdownRoot>
  );
};
