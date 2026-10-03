import { useEffect } from 'react';

import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';

import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { isDefined } from 'twenty-shared/utils';

type RecordDetailRelationRecordsListItemEffectProps = {
  relationRecordId: string;
  relationObjectMetadataNameSingular: string;
};

export const RecordDetailRelationRecordsListItemEffect = ({
  relationRecordId,
  relationObjectMetadataNameSingular,
}: RecordDetailRelationRecordsListItemEffectProps) => {
  const { record } = useFindOneRecord({
    objectNameSingular: relationObjectMetadataNameSingular,
    objectRecordId: relationRecordId,
  });

  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  useEffect(() => {
    if (isDefined(record)) {
      upsertRecordsInStore({ partialRecords: [record] });
    }
  }, [record, upsertRecordsInStore]);

  return null;
};
