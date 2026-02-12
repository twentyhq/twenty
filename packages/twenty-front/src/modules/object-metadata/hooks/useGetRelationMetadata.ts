import { useRecoilCallback } from 'recoil';

import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

export const useGetRelationMetadata = () =>
  useRecoilCallback(
    ({ snapshot }) =>
      ({
        fieldMetadataItem,
      }: {
        fieldMetadataItem: Pick<FieldMetadataItem, 'type' | 'relation'>;
      }) => {
        if (fieldMetadataItem.type !== FieldMetadataType.RELATION) return null;

        const relation = fieldMetadataItem.relation;

        if (!relation) return null;

        const relationObjectMetadataItem = snapshot
          .getLoadable(
            objectMetadataItemFamilySelector({
              objectName: relation.targetObjectMetadata.nameSingular,
              objectNameType: 'singular',
            }),
          )
          .getValue();

        if (!relationObjectMetadataItem) return null;

        const relationFieldMetadataItem =
          relationObjectMetadataItem.fields.find(
            (field) => field.id === relation.targetFieldMetadata.id,
          );

        if (!relationFieldMetadataItem) return null;

        return {
          relationFieldMetadataItem,
          relationObjectMetadataItem,
          relationType: relation.type,
        };
      },
    [],
  );
