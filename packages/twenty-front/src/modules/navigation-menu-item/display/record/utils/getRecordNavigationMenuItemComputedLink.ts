import { recordIdentifierToObjectRecordIdentifier } from '@/navigation-menu-item/common/utils/recordIdentifierToObjectRecordIdentifier';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getRecordNavigationMenuItemComputedLink = (
  item: Pick<
    NavigationMenuItem,
    'targetObjectMetadataId' | 'targetRecordIdentifier'
  >,
  objectMetadataItems: ObjectMetadataItem[],
): string => {
  const objectMetadataItem = objectMetadataItems.find(
    (meta) => meta.id === item.targetObjectMetadataId,
  );
  if (
    !isDefined(objectMetadataItem) ||
    !isDefined(item.targetRecordIdentifier)
  ) {
    return '';
  }
  const objectRecordIdentifier = recordIdentifierToObjectRecordIdentifier({
    recordIdentifier: item.targetRecordIdentifier,
    objectMetadataItem,
  });
  return objectRecordIdentifier.linkToShowPage ?? '';
};
