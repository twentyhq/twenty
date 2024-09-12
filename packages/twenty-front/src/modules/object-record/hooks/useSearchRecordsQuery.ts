import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { RecordGqlOperationGqlRecordFields } from '@/object-record/graphql/types/RecordGqlOperationGqlRecordFields';
import { QueryCursorDirection } from '@/object-record/utils/generateFindManyRecordsQuery';
import { generateSearchRecordsQuery } from '@/object-record/utils/generateSearchRecordsQuery';

export const useSearchRecordsQuery = ({
  objectNameSingular,
  recordGqlFields,
  computeReferences,
}: {
  objectNameSingular: string;
  recordGqlFields?: RecordGqlOperationGqlRecordFields;
  computeReferences?: boolean;
  cursorDirection?: QueryCursorDirection;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const searchRecordsQuery = generateSearchRecordsQuery({
    objectMetadataItem,
    objectMetadataItems,
    recordGqlFields,
    computeReferences,
  });

  return {
    searchRecordsQuery,
  };
};
