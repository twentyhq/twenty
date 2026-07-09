import { type FlatObjectMetadataItem } from '@/metadata-store/types/FlatObjectMetadataItem';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

export const resolveViewNamePlaceholders = (
  viewName: string | undefined,
  objectMetadataItem: FlatObjectMetadataItem | undefined,
): string => {
  if (!isDefined(viewName) || !isDefined(objectMetadataItem)) {
    return viewName ?? '';
  }

  const objectLabelPlural = objectMetadataItem.labelPlural;

  if (viewName === 'All {objectLabelPlural}') {
    return t`All ${objectLabelPlural}`;
  }

  return viewName
    .replace('{objectLabelPlural}', objectMetadataItem.labelPlural)
    .replace('{objectLabelSingular}', objectMetadataItem.labelSingular);
};
