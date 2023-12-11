import { useCallback, useState } from 'react';

import { ObjectSortDropdown } from '@/object-record/object-sort-dropdown/components/ObjectSortDropdown';
import { IconArrowDown, IconArrowUp } from '@/ui/display/icon';
import SortOrFilterChip from '@/views/components/SortOrFilterChip';
import { useViewBar } from '@/views/hooks/useViewBar';

import { SortDirection } from '../types/SortDirection';

export type EditObjectSortProps = {
  sortDropdownId?: string;
  fieldMetadataId: string;
  label: string;
  direction: 'asc' | 'desc';
};

export const EditObjectSort = ({
  sortDropdownId,
  fieldMetadataId,
  label,
  direction,
}: EditObjectSortProps) => {
  const [isSortDirectionMenuUnfolded, setIsSortDirectionMenuUnfolded] =
    useState(false);

  const [selectedSortDirection, setSelectedSortDirection] =
    useState<SortDirection>('asc');

  const resetState = useCallback(() => {
    setIsSortDirectionMenuUnfolded(false);
    setSelectedSortDirection('asc');
  }, []);

  const dropdownScopeId = `sort-${fieldMetadataId}`;

  const { removeViewSort } = useViewBar();

  return (
    <ObjectSortDropdown
      sortDropdownId={sortDropdownId}
      clickableComponent={
        <SortOrFilterChip
          key={fieldMetadataId}
          testId={fieldMetadataId}
          labelValue={label}
          Icon={direction === 'desc' ? IconArrowDown : IconArrowUp}
          isSort
          onRemove={() => removeViewSort(fieldMetadataId)}
        />
      }
      dropdownScopeId={dropdownScopeId}
      dropdownHotkeyScope={{ scope: dropdownScopeId }}
      selectedSortDirection={selectedSortDirection}
      isSortDirectionMenuUnfolded={isSortDirectionMenuUnfolded}
      setIsSortDirectionMenuUnfolded={setIsSortDirectionMenuUnfolded}
      setSelectedSortDirection={setSelectedSortDirection}
      resetState={resetState}
    />
  );
};
