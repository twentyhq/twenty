import { act, renderHook } from '@testing-library/react';
import { Provider } from 'jotai';
import { type ReactNode } from 'react';

import { useTriggerFetchPages } from '@/object-record/record-table/virtualization/hooks/useTriggerFetchPages';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { isTotalNumberOfRowsKnownComponentState } from '@/object-record/record-table/virtualization/states/isTotalNumberOfRowsKnownComponentState';
import { recordTableDataGenerationComponentState } from '@/object-record/record-table/virtualization/states/recordTableDataGenerationComponentState';
import { totalNumberOfRowsComponentState } from '@/object-record/record-table/virtualization/states/totalNumberOfRowsComponentState';
import { numberOfPendingPageFetchesComponentState } from '@/object-record/record-table/virtualization/states/numberOfPendingPageFetchesComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const mockFetch = jest.fn();
const mockLoad = jest.fn();
const mockUpsert = jest.fn();
const mockRestart = jest.fn();
const mockAllocate = jest.fn();
const mockScrollElement = { clientHeight: 500 };
const mockGetScrollWrapperElement = () => ({
  scrollWrapperElement: mockScrollElement,
});

jest.mock('@/object-record/hooks/useLazyFindManyRecordsWithOffset', () => ({
  useLazyFindManyRecordsWithOffset: () => ({
    findManyRecordsLazyWithOffset: mockFetch,
  }),
}));
jest.mock('@/object-record/record-table/contexts/RecordTableContext', () => ({
  useRecordTableContextOrThrow: () => ({ objectNameSingular: 'company' }),
}));
jest.mock('@/object-record/record-index/contexts/RecordIndexContext', () => ({
  useRecordIndexContextOrThrow: () => ({}),
}));
jest.mock('@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement', () => ({
  useScrollWrapperHTMLElement: () => ({
    getScrollWrapperElement: mockGetScrollWrapperElement,
  }),
}));
jest.mock('@/object-record/record-store/hooks/useUpsertRecordsInStore', () => ({
  useUpsertRecordsInStore: () => ({ upsertRecordsInStore: mockUpsert }),
}));
jest.mock(
  '@/object-record/record-table/virtualization/hooks/useLoadRecordsAtRowIndexes',
  () => ({
    useLoadRecordsAtRowIndexes: () => ({ loadRecordsAtRowIndexes: mockLoad }),
  }),
);
jest.mock(
  '@/object-record/record-table/virtualization/hooks/useAllocateRowSlots',
  () => ({ useAllocateRowSlots: () => ({ allocateRowSlots: mockAllocate }) }),
);
jest.mock(
  '@/object-record/record-table/virtualization/hooks/useTriggerInitialRecordTableDataLoad',
  () => ({
    useTriggerInitialRecordTableDataLoad: () => ({
      triggerInitialRecordTableDataLoad: mockRestart,
    }),
  }),
);
jest.mock(
  '@/object-record/record-table/virtualization/utils/getVirtualizationOverscanWindow',
  () => ({
    getVirtualizationOverscanWindow: () => ({
      overscanPageAtTop: 5,
      overscanPageAtBottom: 6,
    }),
  }),
);

const instanceId = 'unknown-count-pagination';
const extent = totalNumberOfRowsComponentState.atomFamily({ instanceId });
const known = isTotalNumberOfRowsKnownComponentState.atomFamily({ instanceId });
const generation = recordTableDataGenerationComponentState.atomFamily({
  instanceId,
});
const pending = numberOfPendingPageFetchesComponentState.atomFamily({
  instanceId,
});
const Wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={jotaiStore}>
    <RecordTableComponentInstanceContext.Provider value={{ instanceId }}>
      <ViewComponentInstanceContext.Provider value={{ instanceId }}>
        {children}
      </ViewComponentInstanceContext.Provider>
    </RecordTableComponentInstanceContext.Provider>
  </Provider>
);

describe('pagination after an exact-count timeout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    jotaiStore.set(extent, 60);
    jotaiStore.set(known, false);
  });

  it('extends the scrollable rows when the next page has more records', async () => {
    const records = Array.from({ length: 10 }, (_, index) => ({
      id: 'record-' + (50 + index),
    }));
    mockFetch.mockResolvedValue({ records, hasNextPage: true });
    const { result } = renderHook(useTriggerFetchPages, { wrapper: Wrapper });
    await act(() => result.current.triggerFetchPagesWithoutDebounce());
    expect(mockFetch).toHaveBeenCalledWith(10, 50);
    expect(jotaiStore.get(extent)).toBe(70);
    expect(jotaiStore.get(known)).toBe(false);
    expect(mockLoad).toHaveBeenCalledWith({ records, startingRowIndex: 50 });
  });

  it('finishes at the exact end without counting the whole table', async () => {
    mockFetch.mockResolvedValue({
      records: [{ id: 'last-row' }],
      hasNextPage: false,
    });
    const { result } = renderHook(useTriggerFetchPages, { wrapper: Wrapper });
    await act(() => result.current.triggerFetchPagesWithoutDebounce());
    expect(jotaiStore.get(extent)).toBe(51);
    expect(jotaiStore.get(known)).toBe(true);
  });

  it('ignores a response from before the table was reloaded', async () => {
    let resolvePage: (page: {
      records: { id: string }[];
      hasNextPage: boolean;
    }) => void = () => undefined;
    mockFetch.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePage = resolve;
        }),
    );
    const { result } = renderHook(useTriggerFetchPages, { wrapper: Wrapper });
    await act(async () => {
      const request = result.current.triggerFetchPagesWithoutDebounce();
      jotaiStore.set(generation, 1);
      resolvePage({ records: [{ id: 'stale-row' }], hasNextPage: false });
      await request;
    });
    expect(mockLoad).not.toHaveBeenCalled();
    expect(jotaiStore.get(extent)).toBe(60);
    expect(jotaiStore.get(pending)).toBe(0);
  });

  it('restarts instead of guessing the count when deletions empty an offset page', async () => {
    mockFetch.mockResolvedValue({ records: [], hasNextPage: false });
    const { result } = renderHook(useTriggerFetchPages, { wrapper: Wrapper });
    await act(() => result.current.triggerFetchPagesWithoutDebounce());
    expect(mockRestart).toHaveBeenCalledTimes(1);
    expect(jotaiStore.get(known)).toBe(false);
    expect(mockLoad).not.toHaveBeenCalled();
  });

  it('preserves a page failure and releases its in-flight marker', async () => {
    const error = new Error('Read deadline exceeded');
    mockFetch.mockRejectedValue(error);
    const { result } = renderHook(useTriggerFetchPages, { wrapper: Wrapper });
    await act(async () => {
      await expect(
        result.current.triggerFetchPagesWithoutDebounce(),
      ).rejects.toBe(error);
    });
    expect(jotaiStore.get(pending)).toBe(0);
    expect(jotaiStore.get(extent)).toBe(60);
    expect(mockLoad).not.toHaveBeenCalled();
  });
});
