import { RecordBoardQueryEffect } from '@/object-record/record-board/components/RecordBoardQueryEffect';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { RecordBoardComponentInstanceContext } from '@/object-record/record-board/states/contexts/RecordBoardComponentInstanceContext';
import { lastRecordBoardQueryIdentifierComponentState } from '@/object-record/record-board/states/lastRecordBoardQueryIdentifierComponentState';
import { lastRecordGroupIdsComponentState } from '@/object-record/record-board/states/lastRecordGroupIdsComponentState';
import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { render } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';

const triggerRecordBoardInitialQueryMock = jest.fn();

jest.mock(
  '@/object-record/record-board/hooks/useRecordBoardQueryIdentifier',
  () => ({
    useRecordBoardQueryIdentifier: () => 'same-query',
  }),
);

jest.mock(
  '@/object-record/record-board/hooks/useTriggerRecordBoardInitialQuery',
  () => ({
    useTriggerRecordBoardInitialQuery: () => ({
      triggerRecordBoardInitialQuery: triggerRecordBoardInitialQueryMock,
    }),
  }),
);

jest.mock(
  '@/object-record/record-board/hooks/useTriggerRecordBoardFetchMore',
  () => ({
    useTriggerRecordBoardFetchMore: () => ({
      triggerRecordBoardFetchMore: jest.fn(),
    }),
  }),
);

jest.mock('@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement', () => ({
  useScrollWrapperHTMLElement: () => ({ scrollWrapperHTMLElement: null }),
}));

const INSTANCE_ID = 'board-view';

describe('RecordBoardQueryEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requeries the same view after returning to a previously loaded board', () => {
    const store = createStore();

    const lastQueryIdentifierAtom =
      lastRecordBoardQueryIdentifierComponentState.atomFamily({
        instanceId: INSTANCE_ID,
      });

    triggerRecordBoardInitialQueryMock.mockImplementation(() => {
      store.set(lastQueryIdentifierAtom, 'same-query');
    });
    store.set(
      lastRecordGroupIdsComponentState.atomFamily({ instanceId: INSTANCE_ID }),
      ['todo'],
    );
    store.set(
      recordGroupIdsComponentState.atomFamily({ instanceId: INSTANCE_ID }),
      ['todo'],
    );

    const wrapper = (
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
              <RecordBoardQueryEffect />
            </RecordBoardComponentInstanceContext.Provider>
          </ViewComponentInstanceContext.Provider>
        </ContextStoreComponentInstanceContext.Provider>
      </JotaiProvider>
    );

    const firstVisit = render(wrapper);

    expect(triggerRecordBoardInitialQueryMock).toHaveBeenCalledTimes(1);
    expect(store.get(lastQueryIdentifierAtom)).toBe('same-query');

    firstVisit.unmount();
    expect(store.get(lastQueryIdentifierAtom)).toBe('');
    render(wrapper);

    expect(triggerRecordBoardInitialQueryMock).toHaveBeenCalledTimes(2);
  });
});
