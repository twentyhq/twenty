import { useContext, useEffect } from 'react';

import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { FieldRelationMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { useSetRecordValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { isDefined } from 'twenty-shared/utils';

type RecordDetailRelationRecordsListItemEffectProps = {
  relationRecordId: string;
};

export const RecordDetailRelationRecordsListItemEffect = ({
  relationRecordId,
}: RecordDetailRelationRecordsListItemEffectProps) => {
  const setRecordValueInContextSelector = useSetRecordValue();

  const { fieldDefinition } = useContext(FieldContext);

  const { relationObjectMetadataNameSingular } =
    fieldDefinition.metadata as FieldRelationMetadata;

  const { record } = useFindOneRecord({
    objectNameSingular: relationObjectMetadataNameSingular,
    objectRecordId: relationRecordId,
  });

  const { upsertRecords } = useUpsertRecordsInStore();

  useEffect(() => {
    if (isDefined(record)) {
      upsertRecords([record]);
      setRecordValueInContextSelector(record.id, record);
    }
  }, [record, upsertRecords, setRecordValueInContextSelector]);

  return null;
};
