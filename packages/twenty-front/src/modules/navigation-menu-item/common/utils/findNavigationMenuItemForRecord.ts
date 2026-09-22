import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const findNavigationMenuItemForRecord = <
  TNavigationMenuItem extends Pick<
    NavigationMenuItem,
    'targetRecordId' | 'targetObjectMetadataId' | 'targetRecordIdentifier'
  >,
>({
  navigationMenuItems,
  recordId,
  targetRecordId = recordId,
  objectMetadataId,
}: {
  navigationMenuItems: TNavigationMenuItem[];
  recordId: string;
  targetRecordId?: string;
  objectMetadataId: string;
}): TNavigationMenuItem | undefined => {
  const matchedIds = new Set([recordId, targetRecordId]);

  return navigationMenuItems.find(
    (item) =>
      item.targetObjectMetadataId === objectMetadataId &&
      ((isDefined(item.targetRecordId) &&
        matchedIds.has(item.targetRecordId)) ||
        (isDefined(item.targetRecordIdentifier) &&
          matchedIds.has(item.targetRecordIdentifier.id))),
  );
};
