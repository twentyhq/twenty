import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type GenerateDepthOneWithoutRelationsRecordGqlFields = {
  objectMetadataItem: ObjectMetadataItem;
};

export const generateDepthOneWithoutRelationsRecordGqlFields = ({
  objectMetadataItem,
}: GenerateDepthOneWithoutRelationsRecordGqlFields) => {
  return objectMetadataItem.fields
    .filter(
      (field) =>
        field.type !== FieldMetadataType.RELATION &&
        field.type !== FieldMetadataType.MORPH_RELATION,
    )
    .reduce<Record<string, true>>((acc, field) => {
      return {
        ...acc,
        [field.name]: true,
      };
    }, {});
};
