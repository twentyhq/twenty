import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { useResetRecordSelectionAcrossRecordGroups } from '@/object-record/record-group/hooks/useResetRecordSelectionAcrossRecordGroups';
import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { NO_RECORD_GROUP_FAMILY_KEY } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { hasUserSelectedAllRecordsComponentState } from '@/object-record/record-selection/states/hasUserSelectedAllRecordsComponentState';
import { isRecordSelectedComponentFamilyState } from '@/object-record/record-selection/states/isRecordSelectedComponentFamilyState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const instanceId = 'record-index-id';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

const setRecordIdsInGroup = ({
  familyKey,
  recordIds,
}: {
  familyKey: string;
  recordIds: string[];
}) =>
  jotaiStore.set(
    recordIndexRecordIdsByGroupComponentFamilyState.atomFamily({
      instanceId,
      familyKey,
    }),
    recordIds,
  );

const isRecordSelected = (recordId: string) =>
  jotaiStore.get(
    isRecordSelectedComponentFamilyState.atomFamily({
      instanceId,
      familyKey: recordId,
    }),
  );

describe('useResetRecordSelectionAcrossRecordGroups', () => {
  beforeEach(() => {
    resetJotaiStore();
  });

  it('should clear records selected in groups that the current layout does not list', () => {
    jotaiStore.set(recordGroupIdsComponentState.atomFamily({ instanceId }), [
      'group-todo',
      'group-done',
    ]);
    setRecordIdsInGroup({ familyKey: 'group-todo', recordIds: ['record-1'] });
    setRecordIdsInGroup({ familyKey: 'group-done', recordIds: ['record-2'] });
    setRecordIdsInGroup({
      familyKey: NO_RECORD_GROUP_FAMILY_KEY,
      recordIds: ['record-3'],
    });

    for (const recordId of ['record-1', 'record-2', 'record-3']) {
      jotaiStore.set(
        isRecordSelectedComponentFamilyState.atomFamily({
          instanceId,
          familyKey: recordId,
        }),
        true,
      );
    }

    jotaiStore.set(
      hasUserSelectedAllRecordsComponentState.atomFamily({ instanceId }),
      true,
    );

    const { result } = renderHook(
      () => useResetRecordSelectionAcrossRecordGroups(instanceId),
      { wrapper: Wrapper },
    );

    act(() => {
      result.current.resetRecordSelectionAcrossRecordGroups();
    });

    expect(isRecordSelected('record-1')).toBe(false);
    expect(isRecordSelected('record-2')).toBe(false);
    expect(isRecordSelected('record-3')).toBe(false);
    expect(
      jotaiStore.get(
        hasUserSelectedAllRecordsComponentState.atomFamily({ instanceId }),
      ),
    ).toBe(false);
  });
});
