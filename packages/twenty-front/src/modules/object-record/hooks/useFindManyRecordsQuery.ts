import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { RecordGqlOperationFields } from '@/object-record/graphql-operations/types/RecordGqlOperationFields';
import { generateFindManyRecordsQuery } from '@/object-record/utils/generateFindManyRecordsQuery';

export const useFindManyRecordsQuery = ({
  objectNameSingular,
  operationFields,
  computeReferences,
}: {
  objectNameSingular: string;
  operationFields?: RecordGqlOperationFields;
  computeReferences?: boolean;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const findManyRecordsQuery = generateFindManyRecordsQuery({
    objectMetadataItem,
    objectMetadataItems,
    operationFields,
    computeReferences,
  });

  return {
    findManyRecordsQuery,
  };
};
