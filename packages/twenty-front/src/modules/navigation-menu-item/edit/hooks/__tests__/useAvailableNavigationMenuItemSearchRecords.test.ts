import { act, renderHook } from '@testing-library/react';
import { useAvailableNavigationMenuItemSearchRecords } from '@/navigation-menu-item/edit/hooks/useAvailableNavigationMenuItemSearchRecords';

jest.mock(
  '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController',
  () => ({
    useNavigationMenuItemEditController: () => ({ currentItems: [] }),
  }),
);
jest.mock('@/side-panel/hooks/useSearchableObjectNameSingulars', () => ({
  useSearchableObjectNameSingulars: () => ['person'],
}));
jest.mock('@/object-record/hooks/useObjectRecordSearchRecords', () => ({
  useObjectRecordSearchRecords: () => ({ loading: false, searchRecords: [] }),
}));

describe('navigation record search empty state', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('keeps loading between quick empty responses until the current search settles', () => {
    const { result, rerender } = renderHook(
      ({ searchInput }) =>
        useAvailableNavigationMenuItemSearchRecords({ searchInput }),
      { initialProps: { searchInput: '' } },
    );

    rerender({ searchInput: 'goo' });
    expect(result.current.recordSearchLoading).toBe(true);
    act(() => jest.advanceTimersByTime(300));
    expect(result.current.recordSearchLoading).toBe(true);

    act(() => jest.advanceTimersByTime(100));
    rerender({ searchInput: 'goog' });
    expect(result.current.recordSearchLoading).toBe(true);
    act(() => jest.advanceTimersByTime(300));
    expect(result.current.recordSearchLoading).toBe(true);
    act(() => jest.advanceTimersByTime(300));
    expect(result.current.recordSearchLoading).toBe(false);
    expect(result.current.availableSearchRecords).toEqual([]);
  });
});
