import { useMemo } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { buildFindOneRecordForShowPageOperationSignature } from '@/object-record/record-show/graphql/operations/factories/findOneRecordForShowPageOperationSignatureFactory';

export const useRecordShowPageResource = ({
  objectNameSingular,
  recordId,
  skip,
}: {
  objectNameSingular: string;
  recordId: string;
  skip?: boolean;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });
  const { objectMetadataItems } = useObjectMetadataItems();
  const operationSignature = useMemo(
    () =>
      buildFindOneRecordForShowPageOperationSignature({
        objectMetadataItem,
        objectMetadataItems,
      }),
    [objectMetadataItem, objectMetadataItems],
  );

  const queryResult = useFindOneRecord({
    objectRecordId: recordId,
    objectNameSingular,
    recordGqlFields: operationSignature.fields,
    withSoftDeleted: true,
    skip,
  });

  return queryResult;
};
