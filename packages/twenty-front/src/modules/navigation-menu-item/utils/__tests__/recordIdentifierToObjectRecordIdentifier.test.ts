import { recordIdentifierToObjectRecordIdentifier } from '@/navigation-menu-item/utils/recordIdentifierToObjectRecordIdentifier';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

jest.mock('@/object-metadata/utils/getAvatarType', () => ({
  getAvatarType: jest.fn(() => 'rounded'),
}));

jest.mock('@/object-metadata/utils/getBasePathToShowPage', () => ({
  getBasePathToShowPage: jest.fn(
    ({ objectNameSingular }: { objectNameSingular: string }) =>
      `/object/${objectNameSingular}/`,
  ),
}));

describe('recordIdentifierToObjectRecordIdentifier', () => {
  const baseRecordIdentifier = {
    id: 'record-123',
    labelIdentifier: 'John Doe',
    imageIdentifier: 'https://example.com/avatar.jpg',
  };

  const baseObjectMetadataItem: ObjectMetadataItem = {
    nameSingular: 'person',
  } as ObjectMetadataItem;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return ObjectRecordIdentifier with id, name, avatarUrl, avatarType, and linkToShowPage', () => {
    const result = recordIdentifierToObjectRecordIdentifier({
      recordIdentifier: baseRecordIdentifier,
      objectMetadataItem: baseObjectMetadataItem,
    });

    expect(result).toEqual({
      id: 'record-123',
      name: 'John Doe',
      avatarUrl: 'https://example.com/avatar.jpg',
      avatarType: 'rounded',
      linkToShowPage: '/object/person/record-123',
    });
  });

  it('should use undefined for avatarUrl when imageIdentifier is null', () => {
    const result = recordIdentifierToObjectRecordIdentifier({
      recordIdentifier: { ...baseRecordIdentifier, imageIdentifier: null },
      objectMetadataItem: baseObjectMetadataItem,
    });

    expect(result.avatarUrl).toBeUndefined();
  });

  it('should return empty linkToShowPage for targets and workspace member', () => {
    const objectMetadataItems: ObjectMetadataItem[] = [
      { nameSingular: CoreObjectNameSingular.NoteTarget } as ObjectMetadataItem,
      {
        nameSingular: CoreObjectNameSingular.WorkspaceMember,
      } as ObjectMetadataItem,
    ];

    objectMetadataItems.forEach((objectMetadataItem) => {
      const result = recordIdentifierToObjectRecordIdentifier({
        recordIdentifier: baseRecordIdentifier,
        objectMetadataItem,
      });
      expect(result.linkToShowPage).toBe('');
    });
  });
});
