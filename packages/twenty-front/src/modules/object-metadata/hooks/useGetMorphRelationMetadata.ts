import { useRecoilCallback } from 'recoil';

import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import {
  FieldMetadataType,
  type RelationType,
} from '~/generated-metadata/graphql';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type FieldMetadataItem } from '../types/FieldMetadataItem';

export const useGetMorphRelationMetadata = () =>
  useRecoilCallback(
    ({ snapshot }) =>
      ({
        fieldMetadataItem,
      }: {
        fieldMetadataItem: Pick<FieldMetadataItem, 'type' | 'morphRelations'>;
      }) => {
        if (fieldMetadataItem.type !== FieldMetadataType.MORPH_RELATION)
          return null;

        const morphRelations = fieldMetadataItem.morphRelations;

        if (!morphRelations || morphRelations.length === 0) return null;

        const relations: {
          relationFieldMetadataItem: FieldMetadataItem;
          relationObjectMetadataItem: ObjectMetadataItem;
          relationType: RelationType;
        }[] = [];
        morphRelations.forEach((morphRelation) => {
          const relationObjectMetadataItem = snapshot
            .getLoadable(
              objectMetadataItemFamilySelector({
                objectName: morphRelation.targetObjectMetadata.nameSingular,
                objectNameType: 'singular',
              }),
            )
            .getValue();

          if (!relationObjectMetadataItem) return null;

          const relationFieldMetadataItem =
            relationObjectMetadataItem.fields.find(
              (field) => field.id === morphRelation.targetFieldMetadata.id,
            );

          if (!relationFieldMetadataItem) return null;

          relations.push({
            relationFieldMetadataItem,
            relationObjectMetadataItem,
            relationType: morphRelation.type,
          });
        });
        return relations;
      },
    [],
  );
