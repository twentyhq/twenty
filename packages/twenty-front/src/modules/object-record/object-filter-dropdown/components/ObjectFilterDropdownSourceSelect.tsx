import { useApplyObjectFilterDropdownFilterValue } from '@/object-record/object-filter-dropdown/hooks/useApplyObjectFilterDropdownFilterValue';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { objectFilterDropdownCurrentRecordFilterComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownCurrentRecordFilterComponentState';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { getActorSourceMultiSelectOptions } from '@/object-record/object-filter-dropdown/utils/getActorSourceMultiSelectOptions';
import { MultipleSelectDropdown } from '@/object-record/select/components/MultipleSelectDropdown';
import { type SelectableItem } from '@/object-record/select/types/SelectableItem';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

export const EMPTY_FILTER_VALUE = '[]';
export const MAX_ITEMS_TO_DISPLAY = 3;

export const ObjectFilterDropdownSourceSelect = ({
  dropdownId,
}: {
  dropdownId: string;
}) => {
  const objectFilterDropdownSearchInput = useRecoilComponentValue(
    objectFilterDropdownSearchInputComponentState,
  );

  const fieldMetadataItemUsedInFilterDropdown = useRecoilComponentValue(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const objectFilterDropdownCurrentRecordFilter = useRecoilComponentValue(
    objectFilterDropdownCurrentRecordFilterComponentState,
  );

  const { applyObjectFilterDropdownFilterValue } =
    useApplyObjectFilterDropdownFilterValue();

  const selectedSources = isNonEmptyString(
    objectFilterDropdownCurrentRecordFilter?.value,
  )
    ? (JSON.parse(objectFilterDropdownCurrentRecordFilter.value) as string[]) // TODO: replace by a safe parse
    : [];

  const sourceTypes = getActorSourceMultiSelectOptions(selectedSources);

  const filteredSelectedItems = sourceTypes.filter((option) =>
    selectedSources.includes(option.id),
  );

  const handleMultipleItemSelectChange = (
    itemToSelect: SelectableItem,
    newSelectedValue: boolean,
  ) => {
    const newSelectedItemIds = newSelectedValue
      ? [...selectedSources, itemToSelect.id]
      : selectedSources.filter((id) => id !== itemToSelect.id);

    if (!isDefined(fieldMetadataItemUsedInFilterDropdown)) {
      throw new Error(
        'Field metadata item used in filter dropdown should be defined',
      );
    }

    const selectedItemNames = sourceTypes
      .filter((option) => newSelectedItemIds.includes(option.id))
      .map((option) => option.name);

    const selectedCount = selectedItemNames.length;
    const filterDisplayValue =
      selectedItemNames.length > MAX_ITEMS_TO_DISPLAY
        ? t`${selectedCount} source types`
        : selectedItemNames.join(', ');

    const newFilterValue =
      newSelectedItemIds.length > 0
        ? JSON.stringify(newSelectedItemIds)
        : EMPTY_FILTER_VALUE;

    applyObjectFilterDropdownFilterValue(newFilterValue, filterDisplayValue);
  };

  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
      <MultipleSelectDropdown
        selectableListId="object-filter-source-select-id"
        focusId={dropdownId}
        itemsToSelect={sourceTypes.filter(
          (item) =>
            !filteredSelectedItems.some((selected) => selected.id === item.id),
        )}
        filteredSelectedItems={filteredSelectedItems}
        selectedItems={filteredSelectedItems}
        onChange={handleMultipleItemSelectChange}
        searchFilter={objectFilterDropdownSearchInput}
        loadingItems={false}
      />
    </DropdownContent>
  );
};
