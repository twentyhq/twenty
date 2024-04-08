import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { QueryFields } from '@/object-record/query-keys/types/QueryFields';
import { generateFindManyRecordsQuery } from '@/object-record/utils/generateFindManyRecordsQuery';

export const useFindManyRecordsQuery = ({
  objectNameSingular,
  queryFields,
  depth,
  computeReferences,
}: {
  objectNameSingular: string;
  queryFields?: QueryFields;
  depth?: number;
  computeReferences?: boolean;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const findManyRecordsQuery = generateFindManyRecordsQuery({
    objectMetadataItem,
    objectMetadataItems,
    queryFields,
    depth,
    computeReferences,
  });

  return {
    findManyRecordsQuery,
  };
};
