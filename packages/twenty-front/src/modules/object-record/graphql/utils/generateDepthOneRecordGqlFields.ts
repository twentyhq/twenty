import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export type GenerateDepthOneRecordGqlFields = {
  objectMetadataItem: ObjectMetadataItem;
};
export const generateDepthOneRecordGqlFields = ({
  objectMetadataItem,
}: GenerateDepthOneRecordGqlFields) =>
  objectMetadataItem.fields.reduce<Record<string, true>>((acc, field) => {
    return {
      ...acc,
      [field.name]: true,
    };
  }, {});
