import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { FieldMetadataType } from '~/generated/graphql';

export type GenerateDepthZeroRecordGqlFields = {
  objectMetadataItem: ObjectMetadataItem;
};

export const generateDepthZeroRecordGqlFields = ({
  objectMetadataItem,
}: GenerateDepthZeroRecordGqlFields) => {
  return objectMetadataItem.fields
    .filter((field) => field.type !== FieldMetadataType.RELATION)
    .reduce<Record<string, true>>((acc, field) => {
      return {
        ...acc,
        [field.name]: true,
      };
    }, {});
};
