import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { RecordGqlOperationSignature } from '@/object-record/graphql/types/RecordGqlOperationSignature';
import { generateCombinedSearchRecordsQuery } from '@/object-record/multiple-objects/utils/generateCombinedSearchRecordsQuery';
import { isNonEmptyArray } from '~/utils/isNonEmptyArray';

export const useGenerateCombinedSearchRecordsQuery = ({
  operationSignatures,
}: {
  operationSignatures: RecordGqlOperationSignature[];
}) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  if (!isNonEmptyArray(operationSignatures)) {
    return null;
  }

  return generateCombinedSearchRecordsQuery({
    objectMetadataItems,
    operationSignatures,
  });
};
