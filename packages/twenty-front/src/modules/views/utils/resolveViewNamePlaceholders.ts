import { t } from '@lingui/core/macro';

import { type FlatObjectMetadataItem } from '@/metadata-store/types/FlatObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';

// The name the engine stores for every object's INDEX view (see
// compute-system-view-to-create.util.ts). It is a literal in the database, so it reaches the
// UI in English no matter which locale the user picked: "All Companies", "All Empresas".
const SYSTEM_INDEX_VIEW_NAME = 'All {objectLabelPlural}';

export const resolveViewNamePlaceholders = (
  viewName: string | undefined,
  objectMetadataItem: FlatObjectMetadataItem | undefined,
): string => {
  if (!isDefined(viewName) || !isDefined(objectMetadataItem)) {
    return viewName ?? '';
  }

  // Translate the engine-provisioned name instead of interpolating it verbatim. Every object
  // gets this view — standard ones and every application's — so on a non-English workspace
  // the "All" prefix showed up untranslated across the whole app. The object label itself is
  // already localized by whoever authored the object, so only the wrapper needs translating.
  if (viewName === SYSTEM_INDEX_VIEW_NAME) {
    return t`All ${objectMetadataItem.labelPlural}`;
  }

  return viewName
    .replace('{objectLabelPlural}', objectMetadataItem.labelPlural)
    .replace('{objectLabelSingular}', objectMetadataItem.labelSingular);
};
