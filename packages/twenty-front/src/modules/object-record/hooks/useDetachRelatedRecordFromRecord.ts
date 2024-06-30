import { Reference, useApolloClient } from '@apollo/client';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getRefName } from '@/object-record/cache/utils/getRefName';
import { modifyRecordFromCache } from '@/object-record/cache/utils/modifyRecordFromCache';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';

type useDetachRelatedRecordFromRecordProps = {
  recordObjectNameSingular: string;
  fieldNameOnRecordObject: string;
};

export const useDetachRelatedRecordFromRecord = ({
  recordObjectNameSingular,
  fieldNameOnRecordObject,
}: useDetachRelatedRecordFromRecordProps) => {
  const apolloClient = useApolloClient();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: recordObjectNameSingular,
  });

  const fieldOnObject = objectMetadataItem.fields.find((field) => {
    return field.name === fieldNameOnRecordObject;
  });

  const relatedRecordObjectNameSingular =
    fieldOnObject?.relationDefinition?.targetObjectMetadata.nameSingular;

  const fieldOnRelatedObject =
    fieldOnObject?.relationDefinition?.targetFieldMetadata.name;

  if (!relatedRecordObjectNameSingular) {
    throw new Error(
      `Could not find record related to ${recordObjectNameSingular}`,
    );
  }

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: relatedRecordObjectNameSingular,
  });

  const updateOneRecordAndDetachRelations = async ({
    recordId,
    relatedRecordId,
  }: {
    recordId: string;
    relatedRecordId: string;
  }) => {
    modifyRecordFromCache({
      objectMetadataItem,
      cache: apolloClient.cache,
      fieldModifiers: {
        [fieldNameOnRecordObject]: (
          fieldNameOnRecordObjectConnection,
          { readField },
        ) => {
          const edges = readField<{ node: Reference }[]>(
            'edges',
            fieldNameOnRecordObjectConnection,
          );

          if (!edges) return fieldNameOnRecordObjectConnection;

          return {
            ...fieldNameOnRecordObjectConnection,
            edges: edges.filter(
              (edge) =>
                !(
                  edge.node.__ref ===
                  getRefName(relatedRecordObjectNameSingular, relatedRecordId)
                ),
            ),
          };
        },
      },
      recordId,
    });
    await updateOneRecord({
      idToUpdate: relatedRecordId,
      updateOneRecordInput: {
        [`${fieldOnRelatedObject}Id`]: null,
      },
    });
  };

  return { updateOneRecordAndDetachRelations };
};
