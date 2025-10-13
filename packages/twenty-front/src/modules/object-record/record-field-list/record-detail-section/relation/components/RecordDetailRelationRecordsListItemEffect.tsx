import { useContext, useEffect } from 'react';

import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { type FieldRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';

import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { isDefined } from 'twenty-shared/utils';

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

  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  useEffect(() => {
    if (isDefined(record)) {
      upsertRecordsInStore([record]);
    }
  }, [record, upsertRecordsInStore]);

  return null;
};
