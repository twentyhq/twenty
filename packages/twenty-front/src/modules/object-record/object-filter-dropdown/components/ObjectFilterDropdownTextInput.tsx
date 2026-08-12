import { type ChangeEvent, useCallback, useState } from 'react';

import { useApplyObjectFilterDropdownFilterValue } from '@/object-record/object-filter-dropdown/hooks/useApplyObjectFilterDropdownFilterValue';
import { useObjectFilterDropdownFilterValue } from '@/object-record/object-filter-dropdown/hooks/useObjectFilterDropdownFilterValue';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { relationTargetFieldMetadataIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/relationTargetFieldMetadataIdUsedInDropdownComponentState';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { DropdownMenuInput } from '@/ui/layout/dropdown/components/DropdownMenuInput';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

type ObjectFilterDropdownTextInputProps = {
  filterDropdownId: string;
};

export const ObjectFilterDropdownTextInput = ({
  filterDropdownId,
}: ObjectFilterDropdownTextInputProps) => {
  const fieldMetadataItemUsedInDropdown = useAtomComponentSelectorValue(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );
  const relationTargetFieldMetadataIdUsedInDropdown =
    useAtomComponentStateValue(
      relationTargetFieldMetadataIdUsedInDropdownComponentState,
    );
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const relationTargetFieldMetadataItem = isDefined(
    relationTargetFieldMetadataIdUsedInDropdown,
  )
    ? objectMetadataItems
        .flatMap((objectMetadataItem) => objectMetadataItem.fields)
        .find(
          (field) => field.id === relationTargetFieldMetadataIdUsedInDropdown,
        )
    : null;

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
        placeholder={
          relationTargetFieldMetadataItem?.label ??
          fieldMetadataItemUsedInDropdown?.label
        }
        onChange={handleInputChange}
        onEnter={() => {
          closeDropdown(filterDropdownId);
        }}
      />
    </DropdownMenuItemsContainer>
  );
};
