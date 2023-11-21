import { useCallback, useState } from 'react';

import { LightButton } from '@/ui/input/button/components/LightButton';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { ObjectSortDropdown } from '@/ui/object/object-sort-dropdown/components/ObjectSortDropdownProps';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { ObjectSortDropdownId } from '../constants/ObjectSortDropdownId';
import { useObjectSortDropdown } from '../hooks/useObjectSortDropdown';
import { SortDirection } from '../types/SortDirection';

export type ObjectSortDropdownButtonProps = {
  hotkeyScope: HotkeyScope;
};

export const ObjectSortDropdownButton = ({
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

  const { isSortSelected } = useObjectSortDropdown();

  const { toggleDropdown } = useDropdown({
    dropdownScopeId: ObjectSortDropdownId,
  });

  const handleButtonClick = () => {
    toggleDropdown();
    resetState();
  };

  return (
    <ObjectSortDropdown
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
  );
};
