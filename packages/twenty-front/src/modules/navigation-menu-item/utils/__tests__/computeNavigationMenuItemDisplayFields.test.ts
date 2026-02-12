import { computeNavigationMenuItemDisplayFields } from '@/navigation-menu-item/utils/computeNavigationMenuItemDisplayFields';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ObjectRecordIdentifier } from '@/object-record/types/ObjectRecordIdentifier';

describe('computeNavigationMenuItemDisplayFields', () => {
  const mockObjectMetadataItem: ObjectMetadataItem = {
    id: 'metadata-id',
    nameSingular: 'person',
    namePlural: 'people',
    labelSingular: 'Person',
    labelPlural: 'People',
  } as ObjectMetadataItem;

  const mockObjectRecordIdentifier: ObjectRecordIdentifier = {
    id: 'record-id',
    name: 'John Doe',
    avatarUrl: 'https://example.com/avatar.jpg',
    avatarType: 'rounded',
    linkToShowPage: '/app/objects/people/record-id',
  };

  it('should return null when objectMetadataItem or objectRecordIdentifier is null', () => {
    expect(
      computeNavigationMenuItemDisplayFields(null, mockObjectRecordIdentifier),
    ).toBeNull();
    expect(
      computeNavigationMenuItemDisplayFields(mockObjectMetadataItem, null),
    ).toBeNull();
  });

  it('should return display fields from metadata and record identifier', () => {
    const result = computeNavigationMenuItemDisplayFields(
      mockObjectMetadataItem,
      mockObjectRecordIdentifier,
    );

    expect(result).toEqual({
      labelIdentifier: 'John Doe',
      avatarUrl: 'https://example.com/avatar.jpg',
      avatarType: 'rounded',
      link: '/app/objects/people/record-id',
      objectNameSingular: 'person',
    });
  });

  it('should default optional identifier fields to empty string or icon', () => {
    const minimal: ObjectRecordIdentifier = {
      id: 'record-id',
      name: 'Jane Doe',
    };
    const result = computeNavigationMenuItemDisplayFields(
      mockObjectMetadataItem,
      minimal,
    );

    expect(result?.avatarUrl).toBe('');
    expect(result?.avatarType).toBe('icon');
    expect(result?.link).toBe('');
  });
});
