import { type ChangeEvent, useCallback, useState } from 'react';

import { useApplyObjectFilterDropdownFilterValue } from '@/object-record/object-filter-dropdown/hooks/useApplyObjectFilterDropdownFilterValue';
import { useObjectFilterDropdownFilterValue } from '@/object-record/object-filter-dropdown/hooks/useObjectFilterDropdownFilterValue';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { DropdownMenuInput } from '@/ui/layout/dropdown/components/DropdownMenuInput';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';

type ObjectFilterDropdownTextInputProps = {
  filterDropdownId: string;
};

export const ObjectFilterDropdownTextInput = ({
  filterDropdownId,
}: ObjectFilterDropdownTextInputProps) => {
  const fieldMetadataItemUsedInDropdown = useRecoilComponentValue(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const { objectFilterDropdownFilterValue } =
    useObjectFilterDropdownFilterValue();

  const { applyObjectFilterDropdownFilterValue } =
    useApplyObjectFilterDropdownFilterValue();

  const { closeDropdown } = useCloseDropdown();

  const [hasFocused, setHasFocused] = useState(false);

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

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;

    applyObjectFilterDropdownFilterValue(newValue);
  };

  return (
    <DropdownMenuItemsContainer>
      <DropdownMenuInput
        instanceId={filterDropdownId}
        ref={handleInputRef}
        value={objectFilterDropdownFilterValue ?? ''}
        autoFocus
        type="text"
        placeholder={fieldMetadataItemUsedInDropdown?.label}
        onChange={handleInputChange}
        onEnter={() => {
          closeDropdown(filterDropdownId);
        }}
      />
    </DropdownMenuItemsContainer>
  );
};
