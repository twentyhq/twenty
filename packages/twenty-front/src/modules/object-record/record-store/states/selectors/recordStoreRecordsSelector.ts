import { selectorFamily } from 'recoil';

import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { isDefined } from 'twenty-shared/utils';

export const recordStoreRecordsSelector = selectorFamily({
  key: 'recordStoreRecordsSelector',
  get:
    ({ recordIds }: { recordIds: string[] }) =>
    () => {
      const records = recordIds
        .map((recordId) =>
          jotaiStore.get(recordStoreFamilyState.atomFamily(recordId)),
        )
        .filter(isDefined);
      return records;
    },
});
