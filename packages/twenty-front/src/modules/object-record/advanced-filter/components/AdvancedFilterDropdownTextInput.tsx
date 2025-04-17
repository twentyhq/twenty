import { useState } from 'react';

import { useApplyRecordFilter } from '@/object-record/record-filter/hooks/useApplyRecordFilter';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';

type AdvancedFilterDropdownTextInputProps = {
  recordFilter: RecordFilter;
};

export const AdvancedFilterDropdownTextInput = ({
  recordFilter,
}: AdvancedFilterDropdownTextInputProps) => {
  const { applyRecordFilter } = useApplyRecordFilter();

  const [inputValue, setInputValue] = useState(() => recordFilter?.value || '');

  const handleChange = (newValue: string) => {
    setInputValue(newValue);

    applyRecordFilter({
      id: recordFilter.id,
      fieldMetadataId: recordFilter?.fieldMetadataId ?? '',
      value: newValue,
      operand: recordFilter.operand,
      displayValue: newValue,
      type: recordFilter.type,
      label: recordFilter.label,
      recordFilterGroupId: recordFilter?.recordFilterGroupId,
      positionInRecordFilterGroup: recordFilter?.positionInRecordFilterGroup,
    });
  };

  return (
    <TextInputV2
      value={inputValue}
      onChange={handleChange}
      placeholder="Enter value"
      fullWidth
    />
  );
};
