import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ObjectRecordIdentifier } from '@/object-record/types/ObjectRecordIdentifier';
import { isDefined } from 'twenty-shared/utils';

export type NavigationMenuItemDisplayFields = {
  labelIdentifier: string;
  avatarUrl: string;
  avatarType: 'icon' | 'rounded' | 'squared';
  link: string;
  objectNameSingular: string;
  Icon?: string;
};

export const computeNavigationMenuItemDisplayFields = (
  objectMetadataItem: ObjectMetadataItem | null,
  objectRecordIdentifier: ObjectRecordIdentifier | null,
): NavigationMenuItemDisplayFields | null => {
  if (!isDefined(objectMetadataItem) || !isDefined(objectRecordIdentifier)) {
    return null;
  }

  const objectNameSingular = objectMetadataItem.nameSingular;

  return {
    labelIdentifier: objectRecordIdentifier.name,
    avatarUrl: objectRecordIdentifier.avatarUrl ?? '',
    avatarType: objectRecordIdentifier.avatarType ?? 'icon',
    link: objectRecordIdentifier.linkToShowPage ?? '',
    objectNameSingular,
  };
};
