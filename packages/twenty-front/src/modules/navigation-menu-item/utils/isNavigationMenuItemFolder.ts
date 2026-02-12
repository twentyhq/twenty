import { isDefined } from 'twenty-shared/utils';

export const isNavigationMenuItemFolder = (item: {
  name?: string | null;
  link?: string | null;
  folderId?: string | null;
  viewId?: string | null;
  targetRecordId?: string | null;
  targetObjectMetadataId?: string | null;
}) =>
  isDefined(item.name) &&
  !isDefined(item.link) &&
  !isDefined(item.targetRecordId) &&
  !isDefined(item.targetObjectMetadataId) &&
  !isDefined(item.viewId);
