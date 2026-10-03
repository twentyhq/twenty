import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { useTriggerRecordBoardInitialQuery } from '@/object-record/record-board/hooks/useTriggerRecordBoardInitialQuery';
import { useTriggerRecordBoardFetchMore } from '@/object-record/record-board/hooks/useTriggerRecordBoardFetchMore';
import { lastRecordBoardQueryIdentifierComponentState } from '@/object-record/record-board/states/lastRecordBoardQueryIdentifierComponentState';
import { recordBoardCurrentGroupByQueryOffsetComponentState } from '@/object-record/record-board/states/recordBoardCurrentGroupByQueryOffsetComponentState';
import { recordBoardQueryGenerationComponentState } from '@/object-record/record-board/states/recordBoardQueryGenerationComponentState';
import { recordBoardShouldFetchMoreInColumnComponentFamilyState } from '@/object-record/record-board/states/recordBoardShouldFetchMoreInColumnComponentFamilyState';
import { recordIndexRecordGroupsAreInInitialLoadingComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupsAreInInitialLoadingComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { renderHook, act } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

const executeGroupedQueryMock = jest.fn();
const setRecordIdsForColumnMock = jest.fn();
const upsertRecordsInStoreMock = jest.fn();

jest.mock(
  '@/object-record/record-index/hooks/useRecordIndexGroupsRecordsLazyGroupBy',
  () => ({
    useRecordIndexGroupsRecordsLazyGroupBy: () => ({
      executeRecordIndexGroupsRecordsLazyGroupBy: executeGroupedQueryMock,
    }),
  }),
);

jest.mock(
  '@/object-record/record-board/hooks/useSetRecordIdsForColumn',
  () => ({
    useSetRecordIdsForColumn: () => ({
      setRecordIdsForColumn: setRecordIdsForColumnMock,
    }),
  }),
);

jest.mock('@/object-record/record-store/hooks/useUpsertRecordsInStore', () => ({
  useUpsertRecordsInStore: () => ({
    upsertRecordsInStore: upsertRecordsInStoreMock,
  }),
}));

jest.mock(
  '@/object-record/record-board/hooks/useRecordBoardQueryIdentifier',
  () => ({
    useRecordBoardQueryIdentifier: () => 'same-query',
  }),
);

jest.mock(
  '@/object-record/record-index/hooks/useRecordIndexGroupCommonQueryVariables',
  () => ({
    useRecordIndexGroupCommonQueryVariables: () => ({ combinedFilters: {} }),
  }),
);

jest.mock('@/object-record/record-index/contexts/RecordIndexContext', () => ({
  useRecordIndexContextOrThrow: () => ({
    objectMetadataItem: { namePlural: 'tasks' },
  }),
}));

jest.mock('@/object-metadata/utils/getFieldMetadataItemGqlFieldName', () => ({
  getFieldMetadataItemGqlFieldName: () => 'status',
}));

jest.mock('@/page-layout/utils/getGroupByQueryResultGqlFieldName', () => ({
  getGroupByQueryResultGqlFieldName: () => 'tasksGroupBy',
}));

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue',
  () => ({
    useAtomComponentSelectorValue: () => [
      { id: 'todo', value: 'TODO', position: 0 },
      { id: 'done', value: 'DONE', position: 1 },
    ],
  }),
);

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({
    useAtomComponentStateValue: () => ({ name: 'status' }),
  }),
);

jest.mock('@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement', () => ({
  useScrollWrapperHTMLElement: () => ({ scrollWrapperHTMLElement: null }),
}));

const INSTANCE_ID = 'board-view';

const groupedPage = (recordIds: string[], totalCount = recordIds.length) => ({
  data: {
    tasksGroupBy: [
      {
        groupByDimensionValues: ['TODO'],
        totalCount,
        edges: recordIds.map((id) => ({ node: { id, status: 'TODO' } })),
      },
    ],
  },
});

const renderBoardHook = <THookResult,>(useHook: () => THookResult) => {
  const store = createStore();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>
      <ContextStoreComponentInstanceContext.Provider
        value={{ instanceId: INSTANCE_ID }}
      >
        <ViewComponentInstanceContext.Provider
          value={{ instanceId: INSTANCE_ID }}
        >
          <RecordBoardComponentInstanceContext.Provider
            value={{ instanceId: INSTANCE_ID }}
          >
            {children}
          </RecordBoardComponentInstanceContext.Provider>
        </ViewComponentInstanceContext.Provider>
      </ContextStoreComponentInstanceContext.Provider>
    </JotaiProvider>
  );

  return {
    store,
    ...renderHook(useHook, { wrapper }),
  };
};

describe('useTriggerRecordBoardInitialQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rebuilds only the completed column across pages and keeps other columns loaded', async () => {
    const { store, result } = renderBoardHook(
      useTriggerRecordBoardInitialQuery,
    );
    const offsetAtom =
      recordBoardCurrentGroupByQueryOffsetComponentState.atomFamily({
        instanceId: INSTANCE_ID,
      });
    const doneHasMoreAtom =
      recordBoardShouldFetchMoreInColumnComponentFamilyState.atomFamily({
        instanceId: INSTANCE_ID,
        familyKey: 'done',
      });
    const doneRecordIdsAtom =
      recordIndexRecordIdsByGroupComponentFamilyState.atomFamily({
        instanceId: INSTANCE_ID,
        familyKey: 'done',
      });

    store.set(offsetAtom, 10);
    store.set(doneHasMoreAtom, true);
    store.set(doneRecordIdsAtom, ['previously-loaded-done-card']);
    executeGroupedQueryMock.mockImplementation(({ variables }) =>
      Promise.resolve(
        groupedPage(
          variables.offsetForRecords === 0
            ? Array.from({ length: 10 }, (_, index) => `old-${index}`)
            : ['old-10', 'old-11', 'new-task'],
          13,
        ),
      ),
    );

    await act(async () => {
      await result.current.triggerRecordBoardInitialQuery({
        shouldResetScroll: false,
        recordGroupId: 'todo',
      });
    });

    expect(executeGroupedQueryMock).toHaveBeenCalledTimes(2);
    expect(executeGroupedQueryMock.mock.calls[0][0].variables.filter).toEqual({
      status: { in: ['TODO'] },
    });
    expect(executeGroupedQueryMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        variables: expect.objectContaining({ offsetForRecords: 0, limit: 1 }),
      }),
    );
    expect(executeGroupedQueryMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        variables: expect.objectContaining({ offsetForRecords: 10, limit: 1 }),
      }),
    );
    expect(setRecordIdsForColumnMock).toHaveBeenCalledTimes(1);
    expect(setRecordIdsForColumnMock).toHaveBeenCalledWith(
      'todo',
      expect.arrayContaining([{ id: 'new-task', status: 'TODO' }]),
    );
    expect(setRecordIdsForColumnMock.mock.calls[0][1]).toHaveLength(13);
    expect(store.get(offsetAtom)).toBe(10);
    expect(store.get(doneHasMoreAtom)).toBe(true);
    expect(store.get(doneRecordIdsAtom)).toEqual([
      'previously-loaded-done-card',
    ]);
  });

  it('knows an exact full first page is complete from its total count', async () => {
    const { store, result } = renderBoardHook(
      useTriggerRecordBoardInitialQuery,
    );
    const todoHasMoreAtom =
      recordBoardShouldFetchMoreInColumnComponentFamilyState.atomFamily({
        instanceId: INSTANCE_ID,
        familyKey: 'todo',
      });

    executeGroupedQueryMock.mockResolvedValue(
      groupedPage(Array.from({ length: 10 }, (_, index) => `old-${index}`)),
    );

    await act(async () => {
      await result.current.triggerRecordBoardInitialQuery({
        shouldResetScroll: false,
      });
    });

    expect(executeGroupedQueryMock).toHaveBeenCalledTimes(1);
    expect(store.get(todoHasMoreAtom)).toBe(false);
  });

  it('ignores a pending result after the board query generation is invalidated', async () => {
    const { store, result } = renderBoardHook(
      useTriggerRecordBoardInitialQuery,
    );
    const generationAtom = recordBoardQueryGenerationComponentState.atomFamily({
      instanceId: INSTANCE_ID,
    });
    const markerAtom = lastRecordBoardQueryIdentifierComponentState.atomFamily({
      instanceId: INSTANCE_ID,
    });
    const loadingAtom =
      recordIndexRecordGroupsAreInInitialLoadingComponentState.atomFamily({
        instanceId: INSTANCE_ID,
      });
    let finishQuery: (value: ReturnType<typeof groupedPage>) => void = () => {};

    executeGroupedQueryMock.mockImplementation(
      () =>
        new Promise<ReturnType<typeof groupedPage>>((resolve) => {
          finishQuery = resolve;
        }),
    );

    let pendingQuery: Promise<void>;

    act(() => {
      pendingQuery = result.current.triggerRecordBoardInitialQuery({
        shouldResetScroll: false,
      });
    });

    expect(store.get(loadingAtom)).toBe(true);
    store.set(generationAtom, store.get(generationAtom) + 1);
    store.set(markerAtom, '');
    store.set(loadingAtom, false);

    await act(async () => {
      finishQuery(groupedPage(['stale-task']));
      await pendingQuery;
    });

    expect(store.get(markerAtom)).toBe('');
    expect(store.get(loadingAtom)).toBe(false);
    expect(setRecordIdsForColumnMock).not.toHaveBeenCalled();
  });
});

describe('useTriggerRecordBoardFetchMore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('stops fetching after an exact full final page', async () => {
    const { store, result } = renderBoardHook(useTriggerRecordBoardFetchMore);
    const todoHasMoreAtom =
      recordBoardShouldFetchMoreInColumnComponentFamilyState.atomFamily({
        instanceId: INSTANCE_ID,
        familyKey: 'todo',
      });
    const doneHasMoreAtom =
      recordBoardShouldFetchMoreInColumnComponentFamilyState.atomFamily({
        instanceId: INSTANCE_ID,
        familyKey: 'done',
      });
    const todoRecordIdsAtom =
      recordIndexRecordIdsByGroupComponentFamilyState.atomFamily({
        instanceId: INSTANCE_ID,
        familyKey: 'todo',
      });

    store.set(todoHasMoreAtom, true);
    store.set(doneHasMoreAtom, false);
    store.set(
      todoRecordIdsAtom,
      Array.from({ length: 10 }, (_, index) => `old-${index}`),
    );
    executeGroupedQueryMock.mockResolvedValue(
      groupedPage(
        Array.from({ length: 10 }, (_, index) => `old-${index + 10}`),
        20,
      ),
    );

    await act(async () => {
      await result.current.triggerRecordBoardFetchMore();
    });

    expect(executeGroupedQueryMock).toHaveBeenCalledWith({
      variables: expect.objectContaining({ offsetForRecords: 10 }),
    });
    expect(store.get(todoRecordIdsAtom)).toHaveLength(20);
    expect(store.get(todoHasMoreAtom)).toBe(false);
  });
});
