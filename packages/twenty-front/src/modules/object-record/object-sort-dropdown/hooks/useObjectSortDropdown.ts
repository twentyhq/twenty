import { useCallback } from 'react';
import { useRecoilValue } from 'recoil';

import { useSortDropdown } from '@/object-record/object-sort-dropdown/hooks/useSortDropdown';
import { SortDefinition } from '@/object-record/object-sort-dropdown/types/SortDefinition';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

import { VIEW_SORT_DROPDOWN_ID } from '@/object-record/object-sort-dropdown/constants/ViewSortDropdownId';
import { isSortDirectionMenuUnfoldedComponentState } from '@/object-record/object-sort-dropdown/states/isSortDirectionMenuUnfoldedState';
import { selectedSortDirectionComponentState } from '@/object-record/object-sort-dropdown/states/selectedSortDirectionState';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { availableSortDefinitionsComponentState } from '@/views/states/availableSortDefinitionsComponentState';
import { OBJECT_SORT_DROPDOWN_ID } from '../constants/ObjectSortDropdownId';

// TODO: merge this with useSortDropdown
export const useObjectSortDropdown = () => {
  const [isSortDirectionMenuUnfolded, setIsSortDirectionMenuUnfolded] =
    useRecoilComponentStateV2(isSortDirectionMenuUnfoldedComponentState);

  const [selectedSortDirection, setSelectedSortDirection] =
    useRecoilComponentStateV2(selectedSortDirectionComponentState);

  const resetState = useCallback(() => {
    setIsSortDirectionMenuUnfolded(false);
    setSelectedSortDirection('asc');
  }, [setIsSortDirectionMenuUnfolded, setSelectedSortDirection]);

  const { toggleDropdown, closeDropdown } = useDropdown(
    OBJECT_SORT_DROPDOWN_ID,
  );

  const toggleSortDropdown = () => {
    toggleDropdown();
    resetState();
  };

  const closeSortDropdown = () => {
    closeDropdown();
    resetState();
  };

  const {
    onSortSelectState,
    isSortSelectedState,
    objectSortDropdownSearchInputState,
    setObjectSortDropdownSearchInput,
    resetSearchInput,
  } = useSortDropdown({
    sortDropdownId: VIEW_SORT_DROPDOWN_ID,
  });

  const isSortSelected = useRecoilValue(isSortSelectedState);

  const availableSortDefinitions = useRecoilComponentValueV2(
    availableSortDefinitionsComponentState,
    VIEW_SORT_DROPDOWN_ID,
  );
  const onSortSelect = useRecoilValue(onSortSelectState);

  const handleAddSort = (selectedSortDefinition: SortDefinition) => {
    closeSortDropdown();
    onSortSelect?.({
      fieldMetadataId: selectedSortDefinition.fieldMetadataId,
      direction: selectedSortDirection,
      definition: selectedSortDefinition,
    });
  };

  return {
    isSortDirectionMenuUnfolded,
    setIsSortDirectionMenuUnfolded,
    selectedSortDirection,
    setSelectedSortDirection,
    toggleSortDropdown,
    resetState,
    isSortSelected,
    objectSortDropdownSearchInputState,
    setObjectSortDropdownSearchInput,
    resetSearchInput,
    availableSortDefinitions,
    handleAddSort,
  };
};
