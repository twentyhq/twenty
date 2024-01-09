import { useRecoilCallback } from 'recoil';

import { entityFieldsFamilyState } from '@/object-record/field/states/entityFieldsFamilyState';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

// TODO: refactor with scoped state later
export const useUpsertRecordFromState = () =>
  useRecoilCallback(
    ({ set }) =>
      <T extends { id: string }>(record: T) =>
        set(entityFieldsFamilyState(record.id), (previousRecord) =>
          isDeeplyEqual(previousRecord, record) ? previousRecord : record,
        ),
    [],
  );
