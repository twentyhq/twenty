import { useRecoilCallback } from 'recoil';

import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

// TODO: refactor with scoped state later
export const useUpsertRecordFromState = () =>
  useRecoilCallback(
    ({ set }) =>
      <T extends ObjectRecord>(record: T) =>
        set(recordStoreFamilyState(record.id), (previousRecord) =>
          isDeeplyEqual(previousRecord, record) ? previousRecord : record,
        ),
    [],
  );
