import { useCurrentRecordGroupId } from '@/object-record/record-group/hooks/useCurrentRecordGroupId';
import { emptyRecordGroupByIdComponentFamilyState } from '@/object-record/record-group/states/emptyRecordGroupByIdComponentFamilyState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useAtomComponentFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyState';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

type RecordListEmptyRecordGroupEffectProps = {
  loading: boolean;
  error?: Error;
  records: ObjectRecord[];
};

export const RecordListEmptyRecordGroupEffect = ({
  loading,
  error,
  records,
}: RecordListEmptyRecordGroupEffectProps) => {
  const currentRecordGroupId = useCurrentRecordGroupId();

  const [, setEmptyRecordGroupById] = useAtomComponentFamilyState(
    emptyRecordGroupByIdComponentFamilyState,
    currentRecordGroupId,
  );

  const [, setRecordIndexRecordIdsByGroup] = useAtomComponentFamilyState(
    recordIndexRecordIdsByGroupComponentFamilyState,
    currentRecordGroupId,
  );

  useEffect(() => {
    if (loading || isDefined(error)) {
      return;
    }

    setRecordIndexRecordIdsByGroup(records.map((record) => record.id));
    setEmptyRecordGroupById(records.length === 0);
  }, [
    loading,
    error,
    records,
    setEmptyRecordGroupById,
    setRecordIndexRecordIdsByGroup,
  ]);

  return null;
};
