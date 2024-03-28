import { useCallback } from 'react';
import { useRecoilState } from 'recoil';

import isSortDirectionMenuUnfoldedState from '@/object-record/object-sort-dropdown/states/isSortDirectionMenuUnfoldedState';
import selectedSortDirectionState from '@/object-record/object-sort-dropdown/states/selectedSortDirectionState';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

import { OBJECT_SORT_DROPDOWN_ID } from '../constants/ObjectSortDropdownId';

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

  const { toggleDropdown } = useDropdown(OBJECT_SORT_DROPDOWN_ID);

  const toggleSortDropdown = () => {
    toggleDropdown();
    resetState();
  };

  return {
    isSortDirectionMenuUnfolded,
    setIsSortDirectionMenuUnfolded,
    selectedSortDirection,
    setSelectedSortDirection,
    toggleSortDropdown,
    resetState,
  };
};
