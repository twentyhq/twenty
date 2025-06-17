import { useApolloClient } from '@apollo/client';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordGqlOperationVariables } from '@/object-record/graphql/types/RecordGqlOperationVariables';
import { useFindOneRecordQuery } from '@/object-record/hooks/useFindOneRecordQuery';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { print } from 'graphql';

export const useUpsertFindOneRecordQueryInCache = ({
  objectMetadataItem,
  recordGqlFields,
  withSoftDeleted = false,
}: {
  objectMetadataItem: ObjectMetadataItem;
  recordGqlFields: Record<string, any>;
  withSoftDeleted?: boolean;
}) => {
  const apolloClient = useApolloClient();

  const { findOneRecordQuery } = useFindOneRecordQuery({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordGqlFields,
    withSoftDeleted,
  });

  const upsertFindOneRecordQueryInCache = <
    T extends ObjectRecord = ObjectRecord,
  >({
    queryVariables,
    objectRecordToOverwrite,
  }: {
    queryVariables: RecordGqlOperationVariables;
    objectRecordToOverwrite: T;
  }) => {
    console.log(
      'findOneRecordQuery',
      print(findOneRecordQuery),
      queryVariables,
    );

    apolloClient.writeQuery({
      query: findOneRecordQuery,
      variables: queryVariables,
      data: {
        [objectMetadataItem.nameSingular]: objectRecordToOverwrite,
      },
    });
  };

  return {
    upsertFindOneRecordQueryInCache,
  };
};
