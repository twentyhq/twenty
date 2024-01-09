import { useRecoilCallback } from 'recoil';

import { entityFieldsFamilySelector } from '@/object-record/field/states/selectors/entityFieldsFamilySelector';
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
          entityFieldsFamilySelector({ entityId: record.id, fieldName }),
          (previousField) =>
            isDeeplyEqual(previousField, record[fieldName])
              ? previousField
              : record[fieldName],
        ),
    [],
  );
