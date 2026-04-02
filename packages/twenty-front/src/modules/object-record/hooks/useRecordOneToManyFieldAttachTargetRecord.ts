import { type Reference } from '@apollo/client';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getEdgeTypename } from '@/object-record/cache/utils/getEdgeTypename';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { getRefName } from '@/object-record/cache/utils/getRefName';
import { modifyRecordFromCache } from '@/object-record/cache/utils/modifyRecordFromCache';

import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { generateDepthRecordGqlFieldsFromRecord } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromRecord';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { CustomError, isDefined } from 'twenty-shared/utils';

export const useRecordOneToManyFieldAttachTargetRecord = () => {
  const apolloCoreClient = useApolloCoreClient();

  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { updateOneRecord } = useUpdateOneRecord();

  const recordOneToManyFieldAttachTargetRecord = async ({
    sourceObjectNameSingular,
    sourceFieldName,
    targetObjectNameSingular,
    targetGQLFieldName,
    sourceRecordId,
    targetRecordId,
  }: {
    sourceObjectNameSingular: string;
    sourceFieldName: string;
    targetObjectNameSingular: string;
    targetGQLFieldName: string;
    sourceRecordId: string;
    targetRecordId: string;
  }) => {
    const targetObjectMetadataItem = objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.nameSingular === targetObjectNameSingular,
    );

    const sourceObjectMetadataItem = objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.nameSingular === sourceObjectNameSingular,
    );

    if (!targetObjectMetadataItem) {
      throw new CustomError(
        `Could not find related object metadata for ${targetObjectNameSingular}`,
        'RELATED_OBJECT_METADATA_NOT_FOUND',
      );
    }

    if (!sourceObjectMetadataItem) {
      throw new CustomError(
        `Could not find source object metadata for ${sourceObjectNameSingular}`,
        'SOURCE_OBJECT_METADATA_NOT_FOUND',
      );
    }

    const cachedTargetRecord = getRecordFromCache({
      objectMetadataItem: targetObjectMetadataItem,
      recordId: targetRecordId,
      cache: apolloCoreClient.cache,
      objectMetadataItems,
      objectPermissionsByObjectMetadataId,
    });

    if (!cachedTargetRecord) {
      throw new Error('Could not find cached related record');
    }

    const previousRecordId = cachedTargetRecord?.[`${targetGQLFieldName}Id`];

    if (isDefined(previousRecordId)) {
      const previousRecord = getRecordFromCache({
        objectMetadataItem: sourceObjectMetadataItem,
        recordId: previousRecordId,
        cache: apolloCoreClient.cache,
        objectMetadataItems,
        objectPermissionsByObjectMetadataId,
      });

      const previousRecordWithRelation = {
        ...cachedTargetRecord,
        [targetGQLFieldName]: previousRecord,
      };

      const gqlFields = generateDepthRecordGqlFieldsFromRecord({
        objectMetadataItem: targetObjectMetadataItem,
        objectMetadataItems,
        record: previousRecordWithRelation,
        depth: 1,
      });

      updateRecordFromCache({
        objectMetadataItems,
        objectMetadataItem: targetObjectMetadataItem,
        cache: apolloCoreClient.cache,
        record: {
          ...cachedTargetRecord,
          [targetGQLFieldName]: previousRecord,
        },
        recordGqlFields: gqlFields,
        objectPermissionsByObjectMetadataId,
      });
    }

    // Update the source record's Apollo cache to include the newly attached
    // target in its one-to-many edges (mirrors detach which removes from edges).
    modifyRecordFromCache({
      objectMetadataItem: sourceObjectMetadataItem,
      cache: apolloCoreClient.cache,
      fieldModifiers: {
        [sourceFieldName]: (
          fieldNameOnRecordObjectConnection,
          { readField },
        ) => {
          const edges = readField<{ node: Reference }[]>(
            'edges',
            fieldNameOnRecordObjectConnection,
          );

          const targetRef = getRefName(
            targetObjectNameSingular,
            targetRecordId,
          );

          // Avoid duplicates
          if (
            edges?.some((edge) => edge.node.__ref === targetRef)
          ) {
            return fieldNameOnRecordObjectConnection;
          }

          const newEdge = {
            __typename: getEdgeTypename(targetObjectNameSingular),
            node: { __ref: targetRef },
            cursor: '',
          };

          return {
            ...fieldNameOnRecordObjectConnection,
            edges: [...(edges ?? []), newEdge],
          };
        },
      },
      recordId: sourceRecordId,
    });

    await updateOneRecord({
      objectNameSingular: targetObjectNameSingular,
      idToUpdate: targetRecordId,
      updateOneRecordInput: {
        [`${targetGQLFieldName}Id`]: sourceRecordId,
      },
    });
  };

  return { recordOneToManyFieldAttachTargetRecord };
};
