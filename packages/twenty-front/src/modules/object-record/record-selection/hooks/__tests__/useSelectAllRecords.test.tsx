import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { NO_RECORD_GROUP_FAMILY_KEY } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { useResetRecordSelection } from '@/object-record/record-selection/hooks/useResetRecordSelection';
import { isRecordSelectedComponentFamilyState } from '@/object-record/record-selection/states/isRecordSelectedComponentFamilyState';
import { useSelectAllRecords } from '@/object-record/record-selection/hooks/useSelectAllRecords';
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

describe('useSelectAllRecords', () => {
  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(
      recordIndexRecordIdsByGroupComponentFamilyState.atomFamily({
        instanceId,
        familyKey: NO_RECORD_GROUP_FAMILY_KEY,
      }),
      ['record-1', 'record-2', 'record-3'],
    );
  });

  it('should select every record, then unselect them on a second call', () => {
    const { result } = renderHook(() => useSelectAllRecords(instanceId), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.selectAllRecords();
    });

    expect(getSelectedRecordIds()).toEqual([
      'record-1',
      'record-2',
      'record-3',
    ]);

    act(() => {
      result.current.selectAllRecords();
    });

    expect(getSelectedRecordIds()).toEqual([]);
  });

  it('should be cleared by useResetRecordSelection', () => {
    const { result } = renderHook(
      () => ({
        ...useSelectAllRecords(instanceId),
        ...useResetRecordSelection(instanceId),
      }),
      { wrapper: Wrapper },
    );

    act(() => {
      result.current.selectAllRecords();
    });
    act(() => result.current.resetRecordSelection());

    expect(getSelectedRecordIds()).toEqual([]);
  });

  it('should select the remaining records when some are already selected', () => {
    jotaiStore.set(
      isRecordSelectedComponentFamilyState.atomFamily({
        instanceId,
        familyKey: 'record-2',
      }),
      true,
    );
    const { result } = renderHook(() => useSelectAllRecords(instanceId), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.selectAllRecords();
    });

    expect(getSelectedRecordIds()).toEqual([
      'record-1',
      'record-2',
      'record-3',
    ]);
  });
});
