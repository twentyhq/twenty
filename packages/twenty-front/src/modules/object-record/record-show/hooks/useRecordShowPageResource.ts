import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { buildFindOneRecordForShowPageOperationSignature } from '@/object-record/record-show/graphql/operations/factories/findOneRecordForShowPageOperationSignatureFactory';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useStore } from 'jotai';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useRecordShowPageResource = ({
  objectNameSingular,
  recordId,
}: {
  objectNameSingular: string;
  recordId: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });
  const { objectMetadataItems } = useObjectMetadataItems();
  const store = useStore();

  const operationSignature = buildFindOneRecordForShowPageOperationSignature({
    objectMetadataItem,
    objectMetadataItems,
  });

  const queryResult = useFindOneRecord({
    objectRecordId: recordId,
    objectNameSingular,
    recordGqlFields: operationSignature.fields,
    withSoftDeleted: true,
  });

  useEffect(() => {
    if (queryResult.loading || !isDefined(queryResult.record)) {
      return;
    }

    const recordAtom = recordStoreFamilyState.atomFamily(recordId);
    const previousRecord = store.get(recordAtom);

    if (JSON.stringify(previousRecord) !== JSON.stringify(queryResult.record)) {
      store.set(recordAtom, queryResult.record);
    }
  }, [queryResult.loading, queryResult.record, recordId, store]);

  return queryResult;
};
