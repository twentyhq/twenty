import { useRecoilCallback } from 'recoil';

import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

// TODO: refactor with scoped state later
export const useUpsertRecordFromState = () =>
  useRecoilCallback(
    ({ set }) =>
      <T extends { id: string }>(record: T) =>
        set(recordStoreFamilyState(record.id), (previousRecord) =>
          isDeeplyEqual(previousRecord, record) ? previousRecord : record,
        ),
    [],
  );
