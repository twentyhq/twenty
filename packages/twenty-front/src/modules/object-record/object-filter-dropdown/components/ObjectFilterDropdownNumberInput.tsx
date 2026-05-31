import { t } from '@lingui/core/macro';
import { type ChangeEvent, useCallback, useState } from 'react';

import { useApplyObjectFilterDropdownFilterValue } from '@/object-record/object-filter-dropdown/hooks/useApplyObjectFilterDropdownFilterValue';
import { useObjectFilterDropdownFilterValue } from '@/object-record/object-filter-dropdown/hooks/useObjectFilterDropdownFilterValue';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { DropdownMenuInput } from '@/ui/layout/dropdown/components/DropdownMenuInput';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { ViewFilterOperand } from 'twenty-shared/types';

type ObjectFilterDropdownNumberInputProps = {
  filterDropdownId: string;
};

const parseBetweenValue = (value: string | undefined): [string, string] => {
  if (!value) return ['', ''];
  const commaIndex = value.indexOf(',');
  if (commaIndex === -1) return [value, ''];
  return [value.slice(0, commaIndex), value.slice(commaIndex + 1)];
};

export const ObjectFilterDropdownNumberInput = ({
  filterDropdownId,
}: ObjectFilterDropdownNumberInputProps) => {
  const fieldMetadataItemUsedInDropdown = useAtomComponentSelectorValue(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const selectedOperandInDropdown = useAtomComponentStateValue(
    selectedOperandInDropdownComponentState,
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

  const isBetween = selectedOperandInDropdown === ViewFilterOperand.IS_BETWEEN;

  const [minValue, maxValue] = parseBetweenValue(
    objectFilterDropdownFilterValue,
  );

  const handleSingleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    applyObjectFilterDropdownFilterValue(newValue);
  };

  const handleMinChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newMin = event.target.value;
    applyObjectFilterDropdownFilterValue(`${newMin},${maxValue}`);
  };

  const handleMaxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newMax = event.target.value;
    applyObjectFilterDropdownFilterValue(`${minValue},${newMax}`);
  };

  if (isBetween) {
    return (
      <DropdownMenuItemsContainer>
        <DropdownMenuInput
          instanceId={`${filterDropdownId}-between-min`}
          ref={handleInputRef}
          value={minValue}
          autoFocus
          type="number"
          placeholder={t`Min`}
          onChange={handleMinChange}
          onEnter={() => closeDropdown(filterDropdownId)}
        />
        <DropdownMenuInput
          instanceId={`${filterDropdownId}-between-max`}
          value={maxValue}
          type="number"
          placeholder={t`Max`}
          onChange={handleMaxChange}
          onEnter={() => closeDropdown(filterDropdownId)}
        />
      </DropdownMenuItemsContainer>
    );
  }

  return (
    <DropdownMenuItemsContainer>
      <DropdownMenuInput
        instanceId={filterDropdownId}
        ref={handleInputRef}
        value={minValue}
        autoFocus
        type="number"
        placeholder={fieldMetadataItemUsedInDropdown?.label}
        onChange={handleSingleInputChange}
        onEnter={() => closeDropdown(filterDropdownId)}
      />
    </DropdownMenuItemsContainer>
  );
};
