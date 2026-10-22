import { fastDeepEqual } from 'twenty-shared/utils';

import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { getRestrictedFieldNamesFromRecord } from '@/object-record/record-store/utils/getRestrictedFieldNamesFromRecord';
import { createAtomFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomFamilySelector';

export const recordStoreRestrictedFieldNamesFamilySelector =
  createAtomFamilySelector<string[], string>({
    key: 'recordStoreRestrictedFieldNamesFamilySelector',
    get:
      (recordId) =>
      ({ get }) =>
        getRestrictedFieldNamesFromRecord({
          record: get(recordStoreFamilyState, recordId),
        }),
    areEqual: fastDeepEqual,
  });
