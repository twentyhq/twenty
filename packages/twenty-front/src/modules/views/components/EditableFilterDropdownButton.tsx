import { useCallback, useEffect } from 'react';

import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { EditableFilterChip } from '@/views/components/EditableFilterChip';

import { formatFieldMetadataItemAsFilterDefinition } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { ObjectFilterOperandSelectAndInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterOperandSelectAndInput';
import { fieldMetadataItemIdUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemIdUsedInDropdownComponentState';
import { filterDefinitionUsedInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/filterDefinitionUsedInDropdownComponentState';
import { selectedFilterComponentState } from '@/object-record/object-filter-dropdown/states/selectedFilterComponentState';
import { selectedOperandInDropdownComponentState } from '@/object-record/object-filter-dropdown/states/selectedOperandInDropdownComponentState';
import { useFilterableFieldMetadataItems } from '@/object-record/record-filter/hooks/useFilterableFieldMetadataItems';
import { useRemoveRecordFilter } from '@/object-record/record-filter/hooks/useRemoveRecordFilter';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useDeleteCombinedViewFilters } from '@/views/hooks/useDeleteCombinedViewFilters';
import { isDefined } from 'twenty-shared';

type EditableFilterDropdownButtonProps = {
  viewFilterDropdownId: string;
  viewFilter: RecordFilter;
  hotkeyScope: HotkeyScope;
};

export const EditableFilterDropdownButton = ({
  viewFilterDropdownId,
  viewFilter,
  hotkeyScope,
}: EditableFilterDropdownButtonProps) => {
  const setFilterDefinitionUsedInDropdown = useSetRecoilComponentStateV2(
    filterDefinitionUsedInDropdownComponentState,
    viewFilterDropdownId,
  );

  const setFieldMetadataItemIdUsedInDropdown = useSetRecoilComponentStateV2(
    fieldMetadataItemIdUsedInDropdownComponentState,
  );

  const setSelectedOperandInDropdown = useSetRecoilComponentStateV2(
    selectedOperandInDropdownComponentState,
    viewFilterDropdownId,
  );

  const setSelectedFilter = useSetRecoilComponentStateV2(
    selectedFilterComponentState,
    viewFilterDropdownId,
  );

  const { filterableFieldMetadataItems } = useFilterableFieldMetadataItems();

  const { closeDropdown } = useDropdown(viewFilterDropdownId);

  const { deleteCombinedViewFilter } = useDeleteCombinedViewFilters();

  useEffect(() => {
    const fieldMetadataItem = filterableFieldMetadataItems.find(
      (fieldMetadataItem) =>
        fieldMetadataItem.id === viewFilter.fieldMetadataId,
    );

    if (!isDefined(fieldMetadataItem)) {
      return;
    }

    const filterDefinition = formatFieldMetadataItemAsFilterDefinition({
      field: fieldMetadataItem,
    });

    if (isDefined(filterDefinition)) {
      setFilterDefinitionUsedInDropdown(filterDefinition);
      setFieldMetadataItemIdUsedInDropdown(filterDefinition.fieldMetadataId);
      setSelectedOperandInDropdown(viewFilter.operand);
      setSelectedFilter(viewFilter);
    }
  }, [
    filterableFieldMetadataItems,
    setFilterDefinitionUsedInDropdown,
    setFieldMetadataItemIdUsedInDropdown,
    viewFilter,
    setSelectedOperandInDropdown,
    setSelectedFilter,
    viewFilterDropdownId,
  ]);

  const { removeRecordFilter } = useRemoveRecordFilter();

  const handleRemove = () => {
    closeDropdown();

    deleteCombinedViewFilter(viewFilter.id);
    removeRecordFilter(viewFilter.fieldMetadataId);
  };

  const handleDropdownClickOutside = useCallback(() => {
    const { id: fieldId, value, operand, fieldMetadataId } = viewFilter;
    if (
      !value &&
      ![
        RecordFilterOperand.IsEmpty,
        RecordFilterOperand.IsNotEmpty,
        RecordFilterOperand.IsInPast,
        RecordFilterOperand.IsInFuture,
        RecordFilterOperand.IsToday,
      ].includes(operand)
    ) {
      removeRecordFilter(fieldMetadataId);
      deleteCombinedViewFilter(fieldId);
    }
  }, [viewFilter, deleteCombinedViewFilter, removeRecordFilter]);

  return (
    <Dropdown
      dropdownId={viewFilterDropdownId}
      clickableComponent={
        <EditableFilterChip viewFilter={viewFilter} onRemove={handleRemove} />
      }
      dropdownComponents={
        <ObjectFilterOperandSelectAndInput
          filterDropdownId={viewFilterDropdownId}
        />
      }
      dropdownHotkeyScope={hotkeyScope}
      dropdownOffset={{ y: 8, x: 0 }}
      dropdownPlacement="bottom-start"
      onClickOutside={handleDropdownClickOutside}
    />
  );
};
