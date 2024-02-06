import { z } from 'zod';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getRelationMetadata } from '@/object-metadata/utils/getRelationMetadata';
import { capitalize } from '~/utils/string/capitalize';

export const generateRelationFieldSchema = ({
  fieldMetadataItem,
  objectMetadataItems,
}: {
  fieldMetadataItem: Pick<
    FieldMetadataItem,
    'fromRelationMetadata' | 'toRelationMetadata' | 'type'
  >;
  objectMetadataItems: ObjectMetadataItem[];
}) => {
  const relationMetadataFromFieldMetadataItem = getRelationMetadata({
    fieldMetadataItem,
    objectMetadataItems,
  });

  if (!relationMetadataFromFieldMetadataItem) return z.never();

  const { relationObjectMetadataItem, relationType } =
    relationMetadataFromFieldMetadataItem;

  const isToOneObject = relationType.endsWith('TO_ONE');
  const relationRecordTypeName = capitalize(
    relationObjectMetadataItem.nameSingular,
  );

  const relationRecordSchema = z
    .object({
      __typename: z
        .literal(relationRecordTypeName)
        .default(relationRecordTypeName),
      id: z.string().uuid(),
    })
    .passthrough();

  if (isToOneObject) {
    return relationRecordSchema.nullable().default(null);
  }

  const relationConnectionTypeName = `${relationRecordTypeName}Connection`;
  const relationEdgeTypeName = `${relationRecordTypeName}Edge`;

  return z
    .object({
      __typename: z
        .literal(relationConnectionTypeName)
        .default(relationConnectionTypeName),
      edges: z
        .array(
          z.object({
            __typename: z
              .literal(relationEdgeTypeName)
              .default(relationEdgeTypeName),
            node: relationRecordSchema,
          }),
        )
        .default([]),
    })
    .passthrough();
};
