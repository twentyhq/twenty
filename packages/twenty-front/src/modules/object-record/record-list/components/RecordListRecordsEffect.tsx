import { useContext, useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { RecordGroupContext } from '@/object-record/record-group/states/context/RecordGroupContext';
import { emptyRecordGroupByIdComponentFamilyState } from '@/object-record/record-group/states/emptyRecordGroupByIdComponentFamilyState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { NO_RECORD_GROUP_FAMILY_KEY } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useSetAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentFamilyState';

type RecordListRecordsEffectProps = {
  records: ObjectRecord[];
  loading: boolean;
  error?: Error;
};

export const RecordListRecordsEffect = ({
  records,
  loading,
  error,
}: RecordListRecordsEffectProps) => {
  const { recordGroupId } = useContext(RecordGroupContext);
  const recordGroupFamilyKey = recordGroupId ?? NO_RECORD_GROUP_FAMILY_KEY;

  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const setRecordIndexRecordIdsByGroup = useSetAtomComponentFamilyState(
    recordIndexRecordIdsByGroupComponentFamilyState,
    recordGroupFamilyKey,
  );

  const setEmptyRecordGroupById = useSetAtomComponentFamilyState(
    emptyRecordGroupByIdComponentFamilyState,
    recordGroupFamilyKey,
  );

  useEffect(() => {
    upsertRecordsInStore({ partialRecords: records });

    if (loading || isDefined(error)) {
      return;
    }

    setRecordIndexRecordIdsByGroup(records.map((record) => record.id));
    setEmptyRecordGroupById(records.length === 0);
  }, [
    error,
    loading,
    records,
    setEmptyRecordGroupById,
    setRecordIndexRecordIdsByGroup,
    upsertRecordsInStore,
  ]);

  return null;
};
