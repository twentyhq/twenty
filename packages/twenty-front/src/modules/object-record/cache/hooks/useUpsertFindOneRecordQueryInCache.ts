import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useFindOneRecordQuery } from '@/object-record/hooks/useFindOneRecordQuery';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export const useUpsertFindOneRecordQueryInCache = ({
  objectMetadataItem,
  recordGqlFields,
  withSoftDeleted = false,
}: {
  objectMetadataItem: ObjectMetadataItem;
  recordGqlFields: Record<string, any>;
  withSoftDeleted?: boolean;
}) => {
  const apolloCoreClient = useApolloCoreClient();

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
    apolloCoreClient.writeQuery({
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
