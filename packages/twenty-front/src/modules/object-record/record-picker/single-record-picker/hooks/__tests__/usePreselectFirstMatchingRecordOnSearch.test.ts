import { renderHook } from '@testing-library/react';

import { usePreselectFirstMatchingRecordOnSearch } from '@/object-record/record-picker/single-record-picker/hooks/usePreselectFirstMatchingRecordOnSearch';

type HookProps = {
  searchFilter: string;
  firstMatchingRecordId: string | undefined;
};

const renderPreselectHook = (initialProps: HookProps) => {
  const preselect = jest.fn();

  const hook = renderHook(
    (props: HookProps) =>
      usePreselectFirstMatchingRecordOnSearch({ ...props, preselect }),
    { initialProps },
  );

  return { ...hook, preselect };
};

describe('usePreselectFirstMatchingRecordOnSearch', () => {
  it('should not preselect anything without a search filter', () => {
    const { preselect } = renderPreselectHook({
      searchFilter: '',
      firstMatchingRecordId: 'record-1',
    });

    expect(preselect).not.toHaveBeenCalled();
  });

  it('should preselect the first match once results arrive for a search filter', () => {
    const { preselect, rerender } = renderPreselectHook({
      searchFilter: 'jo',
      firstMatchingRecordId: undefined,
    });

    expect(preselect).not.toHaveBeenCalled();

    rerender({ searchFilter: 'jo', firstMatchingRecordId: 'record-1' });

    expect(preselect).toHaveBeenCalledTimes(1);
    expect(preselect).toHaveBeenCalledWith('record-1');
  });

  it('should preselect only once per search filter', () => {
    const { preselect, rerender } = renderPreselectHook({
      searchFilter: 'jo',
      firstMatchingRecordId: 'record-1',
    });

    rerender({ searchFilter: 'jo', firstMatchingRecordId: 'record-2' });

    expect(preselect).toHaveBeenCalledTimes(1);
    expect(preselect).toHaveBeenCalledWith('record-1');
  });

  it('should preselect again when the search filter changes', () => {
    const { preselect, rerender } = renderPreselectHook({
      searchFilter: 'jo',
      firstMatchingRecordId: 'record-1',
    });

    rerender({ searchFilter: 'joh', firstMatchingRecordId: 'record-2' });

    expect(preselect).toHaveBeenCalledTimes(2);
    expect(preselect).toHaveBeenLastCalledWith('record-2');
  });

  it('should preselect again after the search filter is cleared and retyped', () => {
    const { preselect, rerender } = renderPreselectHook({
      searchFilter: 'jo',
      firstMatchingRecordId: 'record-1',
    });

    rerender({ searchFilter: '', firstMatchingRecordId: 'record-1' });
    rerender({ searchFilter: 'jo', firstMatchingRecordId: 'record-1' });

    expect(preselect).toHaveBeenCalledTimes(2);
  });
});
