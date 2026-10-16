import { type Reference } from '@apollo/client';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getRefName } from '@/object-record/cache/utils/getRefName';
import { modifyRecordFromCache } from '@/object-record/cache/utils/modifyRecordFromCache';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { CustomError } from 'twenty-shared/utils';

export const useRecordOneToManyFieldDetachTargetRecord = () => {
  const apolloCoreClient = useApolloCoreClient();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { updateOneRecord } = useUpdateOneRecord();

  const recordOneToManyFieldDetachTargetRecord = async ({
    sourceObjectNameSingular,
    targetObjectNameSingular,
    targetGQLFieldName,
    sourceRecordId,
    targetRecordId,
  }: {
    sourceObjectNameSingular: string;
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
        // Error text is used for locale-independent issue grouping.
        // oxlint-disable-next-line lingui/no-unlocalized-strings
        `Could not find related object metadata for ${targetObjectNameSingular}`,
        'RELATED_OBJECT_METADATA_NOT_FOUND',
      );
    }

    if (!sourceObjectMetadataItem) {
      throw new CustomError(
        // Error text is used for locale-independent issue grouping.
        // oxlint-disable-next-line lingui/no-unlocalized-strings
        `Could not find source object metadata for ${sourceObjectNameSingular}`,
        'SOURCE_OBJECT_METADATA_NOT_FOUND',
      );
    }

    modifyRecordFromCache({
      objectMetadataItem: sourceObjectMetadataItem,
      cache: apolloCoreClient.cache,
      fieldModifiers: {
        [targetGQLFieldName]: (
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
                  getRefName(targetObjectNameSingular, targetRecordId)
                ),
            ),
          };
        },
      },
      recordId: sourceRecordId,
    });

    await updateOneRecord({
      objectNameSingular: targetObjectNameSingular,
      idToUpdate: targetRecordId,
      updateOneRecordInput: {
        // Metadata and protocol identifiers must stay stable across locales.
        // oxlint-disable-next-line lingui/no-unlocalized-strings
        [`${targetGQLFieldName}Id`]: null,
      },
    });
  };

  return { recordOneToManyFieldDetachTargetRecord };
};
