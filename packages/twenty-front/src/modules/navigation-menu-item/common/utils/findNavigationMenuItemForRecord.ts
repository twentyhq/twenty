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
  objectMetadataId,
}: {
  navigationMenuItems: TNavigationMenuItem[];
  recordId: string;
  objectMetadataId: string;
}): TNavigationMenuItem | undefined =>
  navigationMenuItems.find(
    (item) =>
      item.targetObjectMetadataId === objectMetadataId &&
      (item.targetRecordId === recordId ||
        (isDefined(item.targetRecordIdentifier) &&
          item.targetRecordIdentifier.id === recordId)),
  );
