import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
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
  targetRecord: ObjectRecord | null,
  objectMetadataItem: ObjectMetadataItem | null,
  objectRecordIdentifier: ObjectRecordIdentifier | null,
): NavigationMenuItemDisplayFields | null => {
  if (!isDefined(targetRecord) || !isDefined(objectMetadataItem)) {
    return null;
  }

  const objectNameSingular = objectMetadataItem.nameSingular;

  if (!isDefined(objectRecordIdentifier)) {
    return {
      labelIdentifier: '',
      avatarUrl: '',
      avatarType: 'icon',
      link: '',
      objectNameSingular,
    };
  }

  return {
    labelIdentifier: objectRecordIdentifier.name,
    avatarUrl: objectRecordIdentifier.avatarUrl ?? '',
    avatarType: objectRecordIdentifier.avatarType ?? 'icon',
    link: objectRecordIdentifier.linkToShowPage ?? '',
    objectNameSingular,
  };
};
