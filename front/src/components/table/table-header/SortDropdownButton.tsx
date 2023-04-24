import { useCallback } from 'react';
import DropdownButton from './DropdownButton';
import { SortType } from './SortAndFilterBar';

type OwnProps = {
  sorts: SortType[];
  setSorts: any;
  sortsAvailable: any;
};

export function SortDropdownButton({
  sortsAvailable,
  setSorts,
  sorts,
}: OwnProps) {
  const onSortItemSelect = useCallback(
    (sortId: string) => {
      const newSorts = [
        {
          label: 'Created at',
          order: 'asc',
          id: sortId,
        } satisfies SortType,
      ];
      setSorts(newSorts);
    },
    [setSorts],
  );

  return (
    <DropdownButton
      label="Sort"
      options={sortsAvailable}
      onSortSelect={onSortItemSelect}
      isActive={sorts.length > 0}
    />
  );
}
