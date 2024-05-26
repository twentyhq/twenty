import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const generateDepthOneRecordGqlFields = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  return objectMetadataItem.fields.reduce((acc, field) => {
    return {
      ...acc,
      [field.name]: true,
    };
  }, {});
};
