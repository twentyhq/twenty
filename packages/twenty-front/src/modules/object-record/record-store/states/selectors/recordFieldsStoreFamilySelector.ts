import { selectorFamily } from 'recoil';

import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';

export const recordFieldsStoreFamilySelector = selectorFamily({
  key: 'recordFieldsStoreFamilySelector',
  get:
    <T>({ fieldNames, recordId }: { fieldNames: string[]; recordId: string }) =>
    ({ get }) => {
      const record = get(recordStoreFamilyState(recordId));
      return fieldNames.map((fieldName) => ({
        values: record?.[fieldName] as T,
        fieldName,
      }));
    },
});
