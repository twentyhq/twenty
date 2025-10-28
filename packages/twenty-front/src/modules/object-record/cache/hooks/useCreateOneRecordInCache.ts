import gql from 'graphql-tag';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { generateDepthRecordGqlFieldsFromRecord } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromRecord';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { prefillRecord } from '@/object-record/utils/prefillRecord';
import { capitalize } from 'twenty-shared/utils';

export const useCreateOneRecordInCache = <T extends ObjectRecord>({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const getRecordFromCache = useGetRecordFromCache({
    objectNameSingular: objectMetadataItem.nameSingular,
  });
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const apolloCoreClient = useApolloCoreClient();

  return (record: ObjectRecord) => {
    const prefilledRecord = prefillRecord({
      objectMetadataItem,
      input: record,
    });
    const recordGqlFields = generateDepthRecordGqlFieldsFromRecord({
      objectMetadataItems,
      objectMetadataItem,
      record: prefilledRecord,
      depth: 1,
    });

    const fragment = gql`
          fragment Create${capitalize(
            objectMetadataItem.nameSingular,
          )}InCache on ${capitalize(
            objectMetadataItem.nameSingular,
          )} ${mapObjectMetadataToGraphQLQuery({
            objectMetadataItems,
            objectMetadataItem,
            computeReferences: true,
            recordGqlFields,
            objectPermissionsByObjectMetadataId,
          })}
        `;

    const recordToCreateWithNestedConnections = getRecordNodeFromRecord({
      record: prefilledRecord,
      objectMetadataItem,
      objectMetadataItems,
    });

    const cachedObjectRecord = {
      __typename: `${capitalize(objectMetadataItem.nameSingular)}`,
      ...recordToCreateWithNestedConnections,
    };

    apolloCoreClient.writeFragment({
      id: `${capitalize(objectMetadataItem.nameSingular)}:${record.id}`,
      fragment,
      data: cachedObjectRecord,
    });
    return getRecordFromCache(record.id) as T;
  };
};
