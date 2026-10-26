import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { NO_RECORD_GROUP_FAMILY_KEY } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { hasUserSelectedAllRecordsComponentState } from '@/object-record/record-selection/states/hasUserSelectedAllRecordsComponentState';
import { selectedRecordIdsComponentSelector } from '@/object-record/record-selection/states/selectors/selectedRecordIdsComponentSelector';
import { useSelectAllRows } from '@/object-record/record-table/hooks/internal/useSelectAllRows';
import { isTotalNumberOfRowsKnownComponentState } from '@/object-record/record-table/virtualization/states/isTotalNumberOfRowsKnownComponentState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const instanceId = 'count-timeout-table';
const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

describe('table selection without an exact count', () => {
  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(
      recordIndexRecordIdsByGroupComponentFamilyState.atomFamily({
        instanceId,
        familyKey: NO_RECORD_GROUP_FAMILY_KEY,
      }),
      ['visible-1', 'visible-2'],
    );
  });

  it.each([true, false])(
    'selects loaded rows and only targets unloaded rows when the count is known: %s',
    (isCountKnown) => {
      jotaiStore.set(
        isTotalNumberOfRowsKnownComponentState.atomFamily({ instanceId }),
        isCountKnown,
      );
      const { result } = renderHook(() => useSelectAllRows(instanceId), {
        wrapper: Wrapper,
      });
      act(() => result.current.selectAllRows());
      expect(
        jotaiStore.get(
          selectedRecordIdsComponentSelector.selectorFamily({ instanceId }),
        ),
      ).toEqual(['visible-1', 'visible-2']);
      expect(
        jotaiStore.get(
          hasUserSelectedAllRecordsComponentState.atomFamily({ instanceId }),
        ),
      ).toBe(isCountKnown);
    },
  );
});
