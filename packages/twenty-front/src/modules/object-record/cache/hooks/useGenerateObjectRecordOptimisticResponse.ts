import { useRecoilCallback } from 'recoil';
import { v4 } from 'uuid';

import { useGetRelationMetadata } from '@/object-metadata/hooks/useGetRelationMetadata';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { generateObjectRecordSchema } from '@/object-record/utils/generateObjectRecordSchema';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const useGenerateObjectRecordOptimisticResponse = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const getRelationMetadata = useGetRelationMetadata();
  const getRecordFromCache = useGetRecordFromCache();

  const generateObjectRecordOptimisticResponse = useRecoilCallback(
    ({ snapshot }) =>
      <GeneratedObjectRecord extends ObjectRecord>(
        input: Record<string, unknown>,
      ) => {
        const objectMetadataItems = snapshot
          .getLoadable(objectMetadataItemsState)
          .valueOrThrow();
        const recordSchema = generateObjectRecordSchema<GeneratedObjectRecord>({
          objectMetadataItem,
          objectMetadataItems,
        });

        const relationFields = objectMetadataItem.fields.reduce<
          Record<string, { id: string } | null>
        >((result, fieldMetadataItem) => {
          const relationFieldName = fieldMetadataItem.name;
          const relationIdFieldName = `${relationFieldName}Id`;

          if (
            fieldMetadataItem.type !== FieldMetadataType.Relation ||
            !(relationIdFieldName in input)
          ) {
            return result;
          }

          const relationRecordId = input[relationIdFieldName] as string | null;
          const relationMetadata = getRelationMetadata({ fieldMetadataItem });

          if (!relationMetadata) return result;

          return {
            ...result,
            [relationFieldName]: relationRecordId
              ? getRecordFromCache({
                  recordId: relationRecordId,
                  objectMetadataItem:
                    relationMetadata.relationObjectMetadataItem,
                })
              : null,
          };
        }, {});

        return recordSchema.parse({
          id: v4(),
          createdAt: new Date().toISOString(),
          ...input,
          ...relationFields,
        });
      },
    [getRecordFromCache, getRelationMetadata, objectMetadataItem],
  );

  return {
    generateObjectRecordOptimisticResponse,
  };
};
