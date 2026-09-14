import { useMemo } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { buildFindOneRecordForShowPageOperationSignature } from '@/object-record/record-show/graphql/operations/factories/findOneRecordForShowPageOperationSignatureFactory';

export const useRecordShowPageOperationSignature = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });
  const { objectMetadataItems } = useObjectMetadataItems();

  return useMemo(
    () =>
      buildFindOneRecordForShowPageOperationSignature({
        objectMetadataItem,
        objectMetadataItems,
      }),
    [objectMetadataItem, objectMetadataItems],
  );
};
