import { t } from '@lingui/core/macro';

import { type FlatObjectMetadataItem } from '@/metadata-store/types/FlatObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';
import { ViewKey } from 'twenty-shared/types';

export const resolveViewNamePlaceholders = (
  viewName: string | undefined,
  objectMetadataItem: FlatObjectMetadataItem | undefined,
  viewKey?: ViewKey | null,
): string => {
  if (!isDefined(viewName) || !isDefined(objectMetadataItem)) {
    return viewName ?? '';
  }

  // The engine stores one name for every object's INDEX view (see
  // compute-system-view-to-create.util.ts). It is a literal in the database, so without
  // translating it the "All" prefix reaches every non-English workspace in English. The object
  // label is already localized by whoever authored the object; only the wrapper needs it.
  //
  // Keyed on `ViewKey.INDEX` rather than on the name: the name is a string a user can also
  // type, and translating a view because it happens to match would rewrite wording its author
  // chose. The key is what actually says "the engine made this one".
  if (viewKey === ViewKey.INDEX) {
    return t`All ${objectMetadataItem.labelPlural}`;
  }

  return viewName
    .replace('{objectLabelPlural}', objectMetadataItem.labelPlural)
    .replace('{objectLabelSingular}', objectMetadataItem.labelSingular);
};
