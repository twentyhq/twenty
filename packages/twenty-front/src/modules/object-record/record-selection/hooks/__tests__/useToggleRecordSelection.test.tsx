import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { NO_RECORD_GROUP_FAMILY_KEY } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useToggleRecordSelection } from '@/object-record/record-selection/hooks/useToggleRecordSelection';
import { RecordSelectionComponentInstanceContext } from '@/object-record/record-selection/states/contexts/RecordSelectionComponentInstanceContext';
import { selectedRecordIdsComponentSelector } from '@/object-record/record-selection/states/selectors/selectedRecordIdsComponentSelector';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const instanceId = 'record-index-id';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <RecordSelectionComponentInstanceContext.Provider value={{ instanceId }}>
      {children}
    </RecordSelectionComponentInstanceContext.Provider>
  </JotaiProvider>
);

const getSelectedRecordIds = () =>
  jotaiStore.get(
    selectedRecordIdsComponentSelector.selectorFamily({ instanceId }),
  );

const renderToggleRecordSelection = () =>
  renderHook(() => useToggleRecordSelection(instanceId), { wrapper: Wrapper })
    .result;

describe('useToggleRecordSelection', () => {
  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(
      recordIndexRecordIdsByGroupComponentFamilyState.atomFamily({
        instanceId,
        familyKey: NO_RECORD_GROUP_FAMILY_KEY,
      }),
      ['a', 'b', 'c', 'd', 'e'],
    );
  });

  it('should toggle a record', () => {
    const result = renderToggleRecordSelection();

    act(() => result.current.toggleRecordSelection({ recordId: 'b' }));
    expect(getSelectedRecordIds()).toEqual(['b']);

    act(() => result.current.toggleRecordSelection({ recordId: 'b' }));
    expect(getSelectedRecordIds()).toEqual([]);
  });

  it('should select from the anchor and replace the previous range', () => {
    const result = renderToggleRecordSelection();

    act(() => result.current.toggleRecordSelection({ recordId: 'c' }));
    act(() =>
      result.current.toggleRecordSelection({
        recordId: 'e',
        shouldSelectRange: true,
      }),
    );
    expect(getSelectedRecordIds()).toEqual(['c', 'd', 'e']);

    act(() =>
      result.current.toggleRecordSelection({
        recordId: 'a',
        shouldSelectRange: true,
      }),
    );
    expect(getSelectedRecordIds()).toEqual(['a', 'b', 'c']);
  });

  it('should keep records selected outside of the range', () => {
    const result = renderToggleRecordSelection();

    act(() => result.current.toggleRecordSelection({ recordId: 'a' }));
    act(() => result.current.toggleRecordSelection({ recordId: 'c' }));
    act(() =>
      result.current.toggleRecordSelection({
        recordId: 'e',
        shouldSelectRange: true,
      }),
    );

    expect(getSelectedRecordIds()).toEqual(['a', 'c', 'd', 'e']);
  });

  it('should toggle the record when there is no anchor', () => {
    const result = renderToggleRecordSelection();

    act(() =>
      result.current.toggleRecordSelection({
        recordId: 'd',
        shouldSelectRange: true,
      }),
    );

    expect(getSelectedRecordIds()).toEqual(['d']);
  });
});
