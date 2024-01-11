import { act, renderHook, waitFor } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useSortDropdown } from '@/object-record/object-sort-dropdown/hooks/useSortDropdown';
import { Sort } from '@/object-record/object-sort-dropdown/types/Sort';
import { SortDefinition } from '@/object-record/object-sort-dropdown/types/SortDefinition';

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RecoilRoot>{children}</RecoilRoot>
);

const sortDropdownId = 'sortDropdownId';
const renderHookConfig = {
  wrapper: Wrapper,
};

const sortDefinitions: SortDefinition[] = [
  { fieldMetadataId: 'id', label: 'definition label', iconName: 'icon' },
];

describe('useSortDropdown', () => {
  it('should set availableSortDefinitions', () => {
    const { result } = renderHook(
      () => useSortDropdown({ sortDropdownId }),
      renderHookConfig,
    );
    expect(result.current.availableSortDefinitions).toEqual([]);
    act(() => {
      result.current.setAvailableSortDefinitions(sortDefinitions);
    });

    waitFor(() => {
      expect(result.current.availableSortDefinitions).toEqual(sortDefinitions);
    });
  });

  it('should set isSortSelected', () => {
    const { result } = renderHook(
      () => useSortDropdown({ sortDropdownId }),
      renderHookConfig,
    );

    expect(result.current.isSortSelected).toBe(false);

    act(() => {
      result.current.setIsSortSelected(true);
    });

    waitFor(() => {
      expect(result.current.isSortSelected).toBe(true);
    });
  });

  it('should set onSortSelect', () => {
    const mockOnSortSelect = jest.fn();
    const { result } = renderHook(
      () => useSortDropdown({ sortDropdownId }),
      renderHookConfig,
    );

    expect(result.current.onSortSelect).toBeUndefined();

    act(() => {
      result.current.setOnSortSelect(mockOnSortSelect);
    });

    waitFor(() => {
      expect(result.current.onSortSelect).toBe(mockOnSortSelect);
    });
  });

  it('should call onSortSelect when a sort option is selected', () => {
    const mockOnSortSelect = jest.fn();
    const sort: Sort = {
      fieldMetadataId: 'id',
      direction: 'asc',
      definition: sortDefinitions[0],
    };

    const { result } = renderHook(
      () => useSortDropdown({ sortDropdownId }),
      renderHookConfig,
    );

    act(() => {
      result.current.setOnSortSelect(mockOnSortSelect);
      result.current.onSortSelect?.(sort);
    });

    waitFor(() => {
      expect(mockOnSortSelect).toHaveBeenCalledWith(sort);
    });
  });
});
