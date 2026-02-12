import { isDefined } from 'twenty-shared/utils';

export const isNavigationMenuItemLink = (item: {
  link?: string | null;
  viewId?: string | null;
  targetRecordId?: string | null;
  targetObjectMetadataId?: string | null;
}) =>
  isDefined(item.link) &&
  (item.link ?? '').trim() !== '' &&
  !isDefined(item.viewId) &&
  !isDefined(item.targetRecordId) &&
  !isDefined(item.targetObjectMetadataId);
