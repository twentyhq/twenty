import { useRecoilCallback } from 'recoil';

import { recordStoreFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreFamilySelector';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useUpsertRecordFieldFromState = () =>
  useRecoilCallback(
    ({ set }) =>
      <T extends { id: string }, F extends keyof T>({
        record,
        fieldName,
      }: {
        record: T;
        fieldName: F extends string ? F : never;
      }) =>
        set(
          recordStoreFamilySelector({ recordId: record.id, fieldName }),
          (previousField) =>
            isDeeplyEqual(previousField, record[fieldName])
              ? previousField
              : record[fieldName],
        ),
    [],
  );
