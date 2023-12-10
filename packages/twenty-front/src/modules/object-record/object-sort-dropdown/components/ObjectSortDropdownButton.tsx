import { useCallback, useState } from 'react';

import { useSortDropdown } from '@/object-record/object-sort-dropdown/hooks/useSortDropdown';
import { ObjectSortDropdownScope } from '@/object-record/object-sort-dropdown/scopes/ObjectSortDropdownScope';
import { LightButton } from '@/ui/input/button/components/LightButton';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { ObjectSortDropdownId } from '../constants/ObjectSortDropdownId';
import { SortDirection } from '../types/SortDirection';
import { ObjectSortDropdown } from '@/object-record/object-sort-dropdown/components/ObjectSortDropdown';

export type ObjectSortDropdownButtonProps = {
  sortDropdownId: string;
  hotkeyScope: HotkeyScope;
};

export const ObjectSortDropdownButton = ({
  sortDropdownId,
  hotkeyScope,
}: ObjectSortDropdownButtonProps) => {
  const [isSortDirectionMenuUnfolded, setIsSortDirectionMenuUnfolded] =
    useState(false);

  const [selectedSortDirection, setSelectedSortDirection] =
    useState<SortDirection>('asc');

  const resetState = useCallback(() => {
    setIsSortDirectionMenuUnfolded(false);
    setSelectedSortDirection('asc');
  }, []);

  const { isSortSelected } = useSortDropdown({
    sortDropdownId,
  });

  const { toggleDropdown } = useDropdown({
    dropdownScopeId: ObjectSortDropdownId,
  });

  const handleButtonClick = () => {
    toggleDropdown();
    resetState();
  };

  return (
    <ObjectSortDropdownScope sortScopeId={sortDropdownId}>
      <ObjectSortDropdown
        sortDropdownId={sortDropdownId}
        clickableComponent={
          <LightButton
            title="Sort"
            active={isSortSelected}
            onClick={handleButtonClick}
          />
        }
        dropdownScopeId={ObjectSortDropdownId}
        dropdownHotkeyScope={hotkeyScope}
        isSortDirectionMenuUnfolded={isSortDirectionMenuUnfolded}
        selectedSortDirection={selectedSortDirection}
        setSelectedSortDirection={setSelectedSortDirection}
        setIsSortDirectionMenuUnfolded={setIsSortDirectionMenuUnfolded}
        resetState={resetState}
      />
    </ObjectSortDropdownScope>
  );
};
