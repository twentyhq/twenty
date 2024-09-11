import { useCallback } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { useSortDropdown } from '@/object-record/object-sort-dropdown/hooks/useSortDropdown';
import isSortDirectionMenuUnfoldedState from '@/object-record/object-sort-dropdown/states/isSortDirectionMenuUnfoldedState';
import selectedSortDirectionState from '@/object-record/object-sort-dropdown/states/selectedSortDirectionState';
import { SortDefinition } from '@/object-record/object-sort-dropdown/types/SortDefinition';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { availableSortDefinitionsComponentState } from '@/views/states/availableSortDefinitionsComponentState';
import {
  OBJECT_SORT_DROPDOWN_ID,
  VIEW_SORT_DROPDOWN_ID,
} from '../constants/ObjectSortDropdownId';

// TODO: merge this with useSortDropdown
export const useObjectSortDropdown = () => {
  const [isSortDirectionMenuUnfolded, setIsSortDirectionMenuUnfolded] =
    useRecoilState(isSortDirectionMenuUnfoldedState);

  const [selectedSortDirection, setSelectedSortDirection] = useRecoilState(
    selectedSortDirectionState,
  );

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
