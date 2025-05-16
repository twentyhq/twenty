import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';

import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';

import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';

import { AdvancedFilterDropdownFieldSelectMenuItem } from '@/object-record/advanced-filter/components/AdvancedFilterDropdownFieldSelectMenuItem';
import { FILTER_FIELD_LIST_ID } from '@/object-record/object-filter-dropdown/constants/FilterFieldListId';
import { useFilterDropdownSelectableFieldMetadataItems } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdownSelectableFieldMetadataItems';
import { FiltersHotkeyScope } from '@/object-record/object-filter-dropdown/types/FiltersHotkeyScope';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useLingui } from '@lingui/react/macro';

export const AdvancedFilterDropdownFieldSelectMenu = () => {
  const setObjectFilterDropdownSearchInput = useSetRecoilComponentStateV2(
    objectFilterDropdownSearchInputComponentState,
  );

  const objectFilterDropdownSearchInput = useRecoilComponentValueV2(
    objectFilterDropdownSearchInputComponentState,
  );

  const {
    selectableHiddenFieldMetadataItems,
    selectableVisibleFieldMetadataItems,
  } = useFilterDropdownSelectableFieldMetadataItems();

  const shouldShowSeparator =
    selectableVisibleFieldMetadataItems.length > 0 &&
    selectableHiddenFieldMetadataItems.length > 0;

  const { t } = useLingui();

  const selectableFieldMetadataItemIds = [
    ...selectableVisibleFieldMetadataItems.map(
      (fieldMetadataItem) => fieldMetadataItem.id,
    ),
    ...selectableHiddenFieldMetadataItems.map(
      (fieldMetadataItem) => fieldMetadataItem.id,
    ),
  ];

  return (
    <>
      <DropdownMenuSearchInput
        value={objectFilterDropdownSearchInput}
        autoFocus
        placeholder={t`Search fields`}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          setObjectFilterDropdownSearchInput(event.target.value)
        }
      />
      <SelectableList
        hotkeyScope={FiltersHotkeyScope.ObjectFilterDropdownButton}
        selectableItemIdArray={selectableFieldMetadataItemIds}
        selectableListInstanceId={FILTER_FIELD_LIST_ID}
      >
        <DropdownMenuItemsContainer>
          {selectableVisibleFieldMetadataItems.map(
            (visibleFieldMetadataItem) => (
              <AdvancedFilterDropdownFieldSelectMenuItem
                key={visibleFieldMetadataItem.id}
                fieldMetadataItemToSelect={visibleFieldMetadataItem}
              />
            ),
          )}
          {shouldShowSeparator && <DropdownMenuSeparator />}
          {selectableHiddenFieldMetadataItems.map((hiddenFieldMetadataItem) => (
            <AdvancedFilterDropdownFieldSelectMenuItem
              key={hiddenFieldMetadataItem.id}
              fieldMetadataItemToSelect={hiddenFieldMetadataItem}
            />
          ))}
        </DropdownMenuItemsContainer>
      </SelectableList>
    </>
  );
};
