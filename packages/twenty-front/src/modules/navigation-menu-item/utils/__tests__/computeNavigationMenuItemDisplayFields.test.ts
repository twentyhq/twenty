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

  it('should return null when objectMetadataItem is null', () => {
    const result = computeNavigationMenuItemDisplayFields(
      null,
      mockObjectRecordIdentifier,
    );

    expect(result).toBeNull();
  });

  it('should return null when objectRecordIdentifier is null', () => {
    const result = computeNavigationMenuItemDisplayFields(
      mockObjectMetadataItem,
      null,
    );

    expect(result).toBeNull();
  });

  it('should return null when both objectMetadataItem and objectRecordIdentifier are null', () => {
    const result = computeNavigationMenuItemDisplayFields(null, null);

    expect(result).toBeNull();
  });

  it('should return complete display fields when all parameters are provided', () => {
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

  it('should handle objectRecordIdentifier with undefined optional fields', () => {
    const identifierWithoutOptionalFields: ObjectRecordIdentifier = {
      id: 'record-id',
      name: 'Jane Doe',
    };

    const result = computeNavigationMenuItemDisplayFields(
      mockObjectMetadataItem,
      identifierWithoutOptionalFields,
    );

    expect(result).toEqual({
      labelIdentifier: 'Jane Doe',
      avatarUrl: '',
      avatarType: 'icon',
      link: '',
      objectNameSingular: 'person',
    });
  });

  it('should use objectMetadataItem nameSingular for objectNameSingular', () => {
    const customMetadataItem: ObjectMetadataItem = {
      ...mockObjectMetadataItem,
      nameSingular: 'company',
    } as ObjectMetadataItem;

    const result = computeNavigationMenuItemDisplayFields(
      customMetadataItem,
      mockObjectRecordIdentifier,
    );

    expect(result?.objectNameSingular).toBe('company');
  });

  it('should handle objectRecordIdentifier with null avatarType', () => {
    const identifierWithNullAvatarType: ObjectRecordIdentifier = {
      id: 'record-id',
      name: 'Test User',
      avatarType: null,
    };

    const result = computeNavigationMenuItemDisplayFields(
      mockObjectMetadataItem,
      identifierWithNullAvatarType,
    );

    expect(result?.avatarType).toBe('icon');
  });

  it('should handle objectRecordIdentifier with undefined linkToShowPage', () => {
    const identifierWithoutLink: ObjectRecordIdentifier = {
      id: 'record-id',
      name: 'Test User',
      linkToShowPage: undefined,
    };

    const result = computeNavigationMenuItemDisplayFields(
      mockObjectMetadataItem,
      identifierWithoutLink,
    );

    expect(result?.link).toBe('');
  });

  it('should handle objectRecordIdentifier with undefined avatarUrl', () => {
    const identifierWithoutAvatarUrl: ObjectRecordIdentifier = {
      id: 'record-id',
      name: 'Test User',
      avatarUrl: undefined,
    };

    const result = computeNavigationMenuItemDisplayFields(
      mockObjectMetadataItem,
      identifierWithoutAvatarUrl,
    );

    expect(result?.avatarUrl).toBe('');
  });

  it('should handle objectRecordIdentifier with undefined avatarType', () => {
    const identifierWithoutAvatarType: ObjectRecordIdentifier = {
      id: 'record-id',
      name: 'Test User',
      avatarType: undefined,
    };

    const result = computeNavigationMenuItemDisplayFields(
      mockObjectMetadataItem,
      identifierWithoutAvatarType,
    );

    expect(result?.avatarType).toBe('icon');
  });
});
