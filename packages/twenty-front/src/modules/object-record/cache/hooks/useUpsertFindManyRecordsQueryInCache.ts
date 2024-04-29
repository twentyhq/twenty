import { useApolloClient } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getRecordConnectionFromRecords } from '@/object-record/cache/utils/getRecordConnectionFromRecords';
import { RecordGqlOperationVariables } from '@/object-record/graphql/types/RecordGqlOperationVariables';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { generateFindManyRecordsQuery } from '@/object-record/utils/generateFindManyRecordsQuery';

export const useUpsertFindManyRecordsQueryInCache = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const apolloClient = useApolloClient();

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const upsertFindManyRecordsQueryInCache = <
    T extends ObjectRecord = ObjectRecord,
  >({
    queryVariables,
    objectRecordsToOverwrite,
    recordGqlFields,
    computeReferences = false,
  }: {
    queryVariables: RecordGqlOperationVariables;
    objectRecordsToOverwrite: T[];
    recordGqlFields?: Record<string, any>;
    computeReferences?: boolean;
  }) => {
    const findManyRecordsQueryForCacheOverwrite = generateFindManyRecordsQuery({
      objectMetadataItem,
      objectMetadataItems,
      recordGqlFields,
      computeReferences,
    });

    const newObjectRecordConnection = getRecordConnectionFromRecords({
      objectMetadataItems: objectMetadataItems,
      objectMetadataItem: objectMetadataItem,
      records: objectRecordsToOverwrite,
      recordGqlFields,
      computeReferences,
    });

    apolloClient.writeQuery({
      query: findManyRecordsQueryForCacheOverwrite,
      variables: queryVariables,
      data: {
        [objectMetadataItem.namePlural]: newObjectRecordConnection,
      },
    });
  };

  return {
    upsertFindManyRecordsQueryInCache,
  };
};
