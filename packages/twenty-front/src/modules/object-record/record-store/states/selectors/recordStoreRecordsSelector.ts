import { selectorFamily } from 'recoil';

import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { isDefined } from 'twenty-shared/utils';

export const recordStoreRecordsSelector = selectorFamily({
  key: 'recordStoreRecordsSelector',
  get:
    ({ recordIds }: { recordIds: string[] }) =>
    ({ get }) => {
      const records = recordIds
        .map((recordId) => get(recordStoreFamilyState(recordId)))
        .filter(isDefined);
      return records;
    },
});
