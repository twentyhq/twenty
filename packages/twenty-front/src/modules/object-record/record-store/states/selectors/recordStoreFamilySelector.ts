import { selectorFamily } from 'recoil';

import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { mergePreviewRecordFamilyState } from '@/object-record/record-merge/states/mergePreviewRecordFamilyState';
import { isDefined } from 'twenty-shared/utils';

export const recordStoreFamilySelector = selectorFamily({
  key: 'recordStoreFamilySelector',
  get:
    <T>({ fieldName, recordId }: { fieldName: string; recordId: string }) =>
    ({ get }) => {
      const previewRecord = get(mergePreviewRecordFamilyState(recordId));
      if (isDefined(previewRecord)) {
        return previewRecord[fieldName] as T;
      }

      return get(recordStoreFamilyState(recordId))?.[fieldName] as T;
    },
  set:
    <T>({ fieldName, recordId }: { fieldName: string; recordId: string }) =>
    ({ set }, newValue: T) =>
      set(recordStoreFamilyState(recordId), (prevState) =>
        prevState
          ? { ...prevState, [fieldName]: newValue }
          : ({ [fieldName]: newValue } as ObjectRecord),
      ),
});
