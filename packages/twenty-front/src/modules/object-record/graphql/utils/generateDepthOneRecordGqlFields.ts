import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isDefined } from '~/utils/isDefined';

export const generateDepthOneRecordGqlFields = ({
  objectMetadataItem,
  record,
}: {
  objectMetadataItem: ObjectMetadataItem;
  record?: Record<string, any>;
}) => {
  const gqlFieldsFromObjectMetadataItem = objectMetadataItem.fields.reduce(
    (acc, field) => {
      return {
        ...acc,
        [field.name]: true,
      };
    },
    {},
  );

  if (isDefined(record)) {
    return Object.keys(gqlFieldsFromObjectMetadataItem).reduce((acc, key) => {
      return {
        ...acc,
        [key]: Object.keys(record).includes(key),
      };
    }, gqlFieldsFromObjectMetadataItem);
  }

  return gqlFieldsFromObjectMetadataItem;
};
