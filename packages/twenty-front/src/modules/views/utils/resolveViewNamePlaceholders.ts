import { type FlatObjectMetadataItem } from '@/metadata-store/types/FlatObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export const resolveViewNamePlaceholders = (
  viewName: string | undefined | null,
  objectMetadataItem: FlatObjectMetadataItem | undefined,
): string => {
  if (!isDefined(viewName)) {
    return '';
  }

  if (!isDefined(objectMetadataItem)) {
    return viewName;
  }

  return viewName
    .replace('{objectLabelPlural}', objectMetadataItem.labelPlural)
    .replace('{objectLabelSingular}', objectMetadataItem.labelSingular);
};
