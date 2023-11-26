import { useCallback, useState } from 'react';

import { IconArrowDown, IconArrowUp } from '@/ui/display/icon';
import { ObjectSortDropdown } from '@/ui/object/object-sort-dropdown/components/ObjectSortDropdown';
import SortOrFilterChip from '@/views/components/SortOrFilterChip';
import { useView } from '@/views/hooks/useView';

import { SortDirection } from '../types/SortDirection';

export type EditObjectSortProps = {
  fieldMetadataId: string;
  label: string;
  direction: 'asc' | 'desc';
};

export const EditObjectSort = ({
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

  const { removeViewSort } = useView();

  return (
    <ObjectSortDropdown
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
