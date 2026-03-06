import { useCallback } from 'react';

import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useStore } from 'jotai';

export const useGetRelationMetadata = () => {
  const store = useStore();

  return useCallback(
    ({
      fieldMetadataItem,
    }: {
      fieldMetadataItem: Pick<FieldMetadataItem, 'type' | 'relation'>;
    }) => {
      if (fieldMetadataItem.type !== FieldMetadataType.RELATION) return null;

      const relation = fieldMetadataItem.relation;

      if (!relation) return null;

      const relationObjectMetadataItem = store.get(
        objectMetadataItemFamilySelector.selectorFamily({
          objectName: relation.targetObjectMetadata.nameSingular,
          objectNameType: 'singular',
        }),
      );

      if (!relationObjectMetadataItem) return null;

      const relationFieldMetadataItem = relationObjectMetadataItem.fields.find(
        (field) => field.id === relation.targetFieldMetadata.id,
      );

      if (!relationFieldMetadataItem) return null;

      return {
        relationFieldMetadataItem,
        relationObjectMetadataItem,
        relationType: relation.type,
      };
    },
    [store],
  );
};
