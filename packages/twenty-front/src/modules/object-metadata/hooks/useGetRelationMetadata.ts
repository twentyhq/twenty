import { useRecoilCallback } from 'recoil';

import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { RelationType } from '@/settings/data-model/types/RelationType';
import {
  FieldMetadataType,
  RelationMetadataType,
} from '~/generated-metadata/graphql';

import { FieldMetadataItem } from '../types/FieldMetadataItem';

export const useGetRelationMetadata = () =>
  useRecoilCallback(
    ({ snapshot }) =>
      ({ fieldMetadataItem }: { fieldMetadataItem: FieldMetadataItem }) => {
        if (fieldMetadataItem.type !== FieldMetadataType.Relation) return null;

        const relationMetadata =
          fieldMetadataItem.fromRelationMetadata ||
          fieldMetadataItem.toRelationMetadata;

        if (!relationMetadata) return null;

        const relationFieldMetadataId =
          'toFieldMetadataId' in relationMetadata
            ? relationMetadata.toFieldMetadataId
            : relationMetadata.fromFieldMetadataId;

        if (!relationFieldMetadataId) return null;

        const relationType =
          relationMetadata.relationType === RelationMetadataType.OneToMany &&
          fieldMetadataItem.toRelationMetadata
            ? 'MANY_TO_ONE'
            : (relationMetadata.relationType as RelationType);

        const relationObjectMetadataNameSingular =
          'toObjectMetadata' in relationMetadata
            ? relationMetadata.toObjectMetadata.nameSingular
            : relationMetadata.fromObjectMetadata.nameSingular;

        const relationObjectMetadataItem = snapshot
          .getLoadable(
            objectMetadataItemFamilySelector({
              objectName: relationObjectMetadataNameSingular,
              objectNameType: 'singular',
            }),
          )
          .getValue();

        if (!relationObjectMetadataItem) return null;

        const relationFieldMetadataItem =
          relationObjectMetadataItem.fields.find(
            (field) => field.id === relationFieldMetadataId,
          );

        if (!relationFieldMetadataItem) return null;

        return {
          relationFieldMetadataItem,
          relationObjectMetadataItem,
          relationType,
        };
      },
    [],
  );
