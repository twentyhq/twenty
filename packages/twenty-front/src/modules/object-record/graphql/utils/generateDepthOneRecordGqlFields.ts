import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export type GenerateDepthOneRecordGqlFields = {
  objectMetadataItem: ObjectMetadataItem;
};

export const generateDepthOneRecordGqlFields = ({
  objectMetadataItem,
}: GenerateDepthOneRecordGqlFields) =>
  objectMetadataItem.readableFields.reduce<Record<string, true>>(
    (acc, field) => {
      return {
        ...acc,
        ...(isDefined(field.settings?.joinColumnName)
          ? {
              [field.settings.joinColumnName]: true,
            }
          : {}),
        [field.name]: true,
      };
    },
    {},
  );
