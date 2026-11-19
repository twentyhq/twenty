import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useSelectAllInboxThreads } from '@/inbox/hooks/useSelectAllInboxThreads';
import { inboxListRecordSelectionInstanceIdState } from '@/inbox/states/inboxListRecordSelectionInstanceIdState';
import { NO_RECORD_GROUP_FAMILY_KEY } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { isRecordSelectedComponentFamilyState } from '@/object-record/record-selection/states/isRecordSelectedComponentFamilyState';
import { selectedRecordIdsComponentSelector } from '@/object-record/record-selection/states/selectors/selectedRecordIdsComponentSelector';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const instanceId = 'inbox-record-selection';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

const getSelectedThreadIds = () =>
  jotaiStore.get(
    selectedRecordIdsComponentSelector.selectorFamily({ instanceId }),
  );

describe('useSelectAllInboxThreads', () => {
  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(
      recordIndexRecordIdsByGroupComponentFamilyState.atomFamily({
        instanceId,
        familyKey: NO_RECORD_GROUP_FAMILY_KEY,
      }),
      ['thread-1', 'thread-2', 'thread-3'],
    );
  });

  it('selects every listed chat', () => {
    jotaiStore.set(inboxListRecordSelectionInstanceIdState.atom, instanceId);
    const { result } = renderHook(() => useSelectAllInboxThreads(), {
      wrapper: Wrapper,
    });

    act(() => result.current.selectAllInboxThreads());

    expect(getSelectedThreadIds()).toEqual([
      'thread-1',
      'thread-2',
      'thread-3',
    ]);
  });

  it('keeps every chat selected when called again', () => {
    jotaiStore.set(inboxListRecordSelectionInstanceIdState.atom, instanceId);
    jotaiStore.set(
      isRecordSelectedComponentFamilyState.atomFamily({
        instanceId,
        familyKey: 'thread-2',
      }),
      true,
    );
    const { result } = renderHook(() => useSelectAllInboxThreads(), {
      wrapper: Wrapper,
    });

    act(() => result.current.selectAllInboxThreads());
    act(() => result.current.selectAllInboxThreads());

    expect(getSelectedThreadIds()).toEqual([
      'thread-1',
      'thread-2',
      'thread-3',
    ]);
  });

  it('selects nothing while the inbox list is not shown', () => {
    const { result } = renderHook(() => useSelectAllInboxThreads(), {
      wrapper: Wrapper,
    });

    act(() => result.current.selectAllInboxThreads());

    expect(getSelectedThreadIds()).toEqual([]);
  });
});
