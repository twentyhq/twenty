import { useApolloClient } from '@apollo/client';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useFindOneRecordQuery } from '@/object-record/hooks/useFindOneRecordQuery';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

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
    objectRecordId,
    objectRecordToOverwrite,
  }: {
    objectRecordId: string;
    objectRecordToOverwrite: T;
  }) => {
    apolloClient.writeQuery({
      query: findOneRecordQuery,
      variables: { objectRecordId },
      data: {
        [objectMetadataItem.nameSingular]: objectRecordToOverwrite,
      },
    });
  };

  return {
    upsertFindOneRecordQueryInCache,
  };
};
