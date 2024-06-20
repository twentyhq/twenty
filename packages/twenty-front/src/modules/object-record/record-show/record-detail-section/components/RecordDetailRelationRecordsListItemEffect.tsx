import { useContext, useEffect } from 'react';

import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { FieldRelationMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { useSetRecordInStore } from '@/object-record/record-store/hooks/useSetRecordInStore';
import { isDefined } from '~/utils/isDefined';

type RecordDetailRelationRecordsListItemEffectProps = {
  relationRecordId: string;
};

export const RecordDetailRelationRecordsListItemEffect = ({
  relationRecordId,
}: RecordDetailRelationRecordsListItemEffectProps) => {
  const { fieldDefinition } = useContext(FieldContext);

  const { relationObjectMetadataNameSingular } =
    fieldDefinition.metadata as FieldRelationMetadata;

  const { record } = useFindOneRecord({
    objectNameSingular: relationObjectMetadataNameSingular,
    objectRecordId: relationRecordId,
  });

  const { setRecords } = useSetRecordInStore();

  useEffect(() => {
    if (isDefined(record)) {
      setRecords([record]);
    }
  }, [record, setRecords]);

  return null;
};
