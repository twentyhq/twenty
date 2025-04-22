import { ChangeEvent, useCallback, useState } from 'react';
import { v4 } from 'uuid';

import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { selectedFilterComponentState } from '@/object-record/object-filter-dropdown/states/selectedFilterComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { useApplyRecordFilter } from '@/object-record/record-filter/hooks/useApplyRecordFilter';
import { DropdownMenuInput } from '@/ui/layout/dropdown/components/DropdownMenuInput';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

export const ObjectFilterDropdownNumberInput = () => {
  const selectedOperandInDropdown = useRecoilComponentValueV2(
    selectedOperandInDropdownComponentState,
  );

  const fieldMetadataItemUsedInDropdown = useRecoilComponentValueV2(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const selectedFilter = useRecoilComponentValueV2(
    selectedFilterComponentState,
  );

  const { applyRecordFilter } = useApplyRecordFilter();

  const [hasFocused, setHasFocused] = useState(false);

  const [inputValue, setInputValue] = useState(
    () => selectedFilter?.value || '',
  );

  const handleInputRef = useCallback(
    (node: HTMLInputElement | null) => {
      if (Boolean(node) && !hasFocused) {
        node?.focus();
        node?.select();
        setHasFocused(true);
      }
    },
    [hasFocused],
  );

  return (
    fieldMetadataItemUsedInDropdown &&
    selectedOperandInDropdown && (
      <DropdownMenuItemsContainer>
        <DropdownMenuInput
          ref={handleInputRef}
          value={inputValue}
          autoFocus
          type="number"
          placeholder={fieldMetadataItemUsedInDropdown.label}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const newValue = event.target.value;

            setInputValue(newValue);

            applyRecordFilter({
              id: selectedFilter?.id ? selectedFilter.id : v4(),
              fieldMetadataId: fieldMetadataItemUsedInDropdown?.id ?? '',
              value: newValue,
              operand: selectedOperandInDropdown,
              displayValue: newValue,
              type: getFilterTypeFromFieldType(
                fieldMetadataItemUsedInDropdown.type,
              ),
              label: fieldMetadataItemUsedInDropdown.label,
              recordFilterGroupId: selectedFilter?.recordFilterGroupId,
              positionInRecordFilterGroup:
                selectedFilter?.positionInRecordFilterGroup,
              subFieldName: selectedFilter?.subFieldName,
            });
          }}
        />
      </DropdownMenuItemsContainer>
    )
  );
};
