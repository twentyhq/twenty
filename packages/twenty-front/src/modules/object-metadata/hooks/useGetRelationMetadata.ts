import { useRecoilCallback } from 'recoil';

import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { FieldMetadataType } from '~/generated-metadata/graphql';

import { FieldMetadataItem } from '../types/FieldMetadataItem';

export const useGetRelationMetadata = () =>
  useRecoilCallback(
    ({ snapshot }) =>
      ({
        fieldMetadataItem,
      }: {
        fieldMetadataItem: Pick<
          FieldMetadataItem,
          'type' | 'relationDefinition'
        >;
      }) => {
        if (fieldMetadataItem.type !== FieldMetadataType.Relation) return null;

        const relationDefinition = fieldMetadataItem.relationDefinition;

        if (!relationDefinition) return null;

        const relationObjectMetadataItem = snapshot
          .getLoadable(
            objectMetadataItemFamilySelector({
              objectName: relationDefinition.targetObjectMetadata.nameSingular,
              objectNameType: 'singular',
            }),
          )
          .getValue();

        if (!relationObjectMetadataItem) return null;

        const relationFieldMetadataItem =
          relationObjectMetadataItem.fields.find(
            (field) => field.id === relationDefinition.targetFieldMetadata.id,
          );

        if (!relationFieldMetadataItem) return null;

        return {
          relationFieldMetadataItem,
          relationObjectMetadataItem,
          relationType: relationDefinition.direction,
        };
      },
    [],
  );
