import { useCallback } from 'react';
import { v4 } from 'uuid';

import { useColumnDefinitionsFromFieldMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromFieldMetadata';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';

import { availableFieldMetadataItemsForFilterFamilySelector } from '@/object-metadata/states/availableFieldMetadataItemsForFilterFamilySelector';
import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';

import { useSelectFilterUsedInDropdown } from '@/object-record/object-filter-dropdown/hooks/useSelectFilterUsedInDropdown';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { getRecordFilterOperands } from '@/object-record/record-filter/utils/getRecordFilterOperands';
import { useSetActiveDropdownFocusIdAndMemorizePrevious } from '@/ui/layout/dropdown/hooks/useSetFocusedDropdownIdAndMemorizePrevious';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';
import { useRecoilCallback, useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared';

type UseHandleToggleColumnFilterProps = {
  objectNameSingular: string;
  viewBarId: string;
};

export const useHandleToggleColumnFilter = ({
  objectNameSingular,
  viewBarId,
}: UseHandleToggleColumnFilterProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { columnDefinitions } =
    useColumnDefinitionsFromFieldMetadata(objectMetadataItem);

  const { upsertRecordFilter } = useUpsertRecordFilter();

  const { setActiveDropdownFocusIdAndMemorizePrevious } =
    useSetActiveDropdownFocusIdAndMemorizePrevious();

  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  const openDropdown = useRecoilCallback(
    ({ set }) => {
      return (dropdownId: string) => {
        const dropdownOpenState = extractComponentState(
          isDropdownOpenComponentState,
          dropdownId,
        );

        setActiveDropdownFocusIdAndMemorizePrevious(dropdownId);
        setHotkeyScopeAndMemorizePreviousScope(dropdownId);

        set(dropdownOpenState, true);
      };
    },
    [
      setActiveDropdownFocusIdAndMemorizePrevious,
      setHotkeyScopeAndMemorizePreviousScope,
    ],
  );

  const availableFieldMetadataItemsForFilter = useRecoilValue(
    availableFieldMetadataItemsForFilterFamilySelector({
      objectMetadataItemId: objectMetadataItem.id,
    }),
  );

  const { selectFilterUsedInDropdown } =
    useSelectFilterUsedInDropdown(viewBarId);

  const currentRecordFilters = useRecoilComponentValueV2(
    currentRecordFiltersComponentState,
  );

  const handleToggleColumnFilter = useCallback(
    async (fieldMetadataId: string) => {
      const correspondingColumnDefinition = columnDefinitions.find(
        (columnDefinition) =>
          columnDefinition.fieldMetadataId === fieldMetadataId,
      );

      if (!isDefined(correspondingColumnDefinition)) return;

      const newFilterId = v4();

      const existingRecordFilter = currentRecordFilters.find(
        (recordFilter) => recordFilter.fieldMetadataId === fieldMetadataId,
      );

      if (!isDefined(existingRecordFilter)) {
        const fieldMetadataItem = availableFieldMetadataItemsForFilter.find(
          (fieldMetadataItemToFind) =>
            fieldMetadataItemToFind.id === fieldMetadataId,
        );

        if (!isDefined(fieldMetadataItem)) {
          throw new Error('Field metadata item not found');
        }

        const filterType = getFilterTypeFromFieldType(fieldMetadataItem.type);

        const availableOperandsForFilter = getRecordFilterOperands({
          filterType,
        });

        const defaultOperand = availableOperandsForFilter[0];

        const newFilter: RecordFilter = {
          id: newFilterId,
          fieldMetadataId,
          operand: defaultOperand,
          displayValue: '',
          label: fieldMetadataItem.label,
          type: filterType,
          value: '',
        };

        upsertRecordFilter(newFilter);

        selectFilterUsedInDropdown({ fieldMetadataItemId: fieldMetadataId });
      }

      openDropdown(existingRecordFilter?.id ?? newFilterId);
    },
    [
      openDropdown,
      columnDefinitions,
      selectFilterUsedInDropdown,
      currentRecordFilters,
      availableFieldMetadataItemsForFilter,
      upsertRecordFilter,
    ],
  );

  return handleToggleColumnFilter;
};
