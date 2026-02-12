import { type Favorite } from '@/favorites/types/Favorite';
import { sortFavorites } from '@/favorites/utils/sortFavorites';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type ObjectRecordIdentifier } from '@/object-record/types/ObjectRecordIdentifier';
import { type View } from '@/views/types/View';
import { FieldMetadataType } from '~/generated-metadata/graphql';

jest.mock('@/favorites/utils/getObjectMetadataNamePluralFromViewId', () => ({
  getObjectMetadataNamePluralFromViewId: jest.fn(
    (
      view: Pick<View, 'id' | 'name' | 'objectMetadataId'>,
      items: ObjectMetadataItem[],
    ) => {
      const item = items.find((item) => item.id === view.objectMetadataId);
      return { namePlural: item?.namePlural ?? 'items' };
    },
  ),
}));

jest.mock('twenty-shared/utils', () => {
  const actual = jest.requireActual('twenty-shared/utils');
  return {
    ...actual,
    getAppPath: jest.fn((path, params, query) => {
      const basePath = `/app/objects/${params.objectNamePlural}`;
      const viewId = query?.viewId;
      if (viewId !== undefined && viewId !== null) {
        return `${basePath}?viewId=${viewId}`;
      }
      return basePath;
    }),
  };
});

describe('sortFavorites', () => {
  const mockView: Pick<View, 'id' | 'name' | 'objectMetadataId' | 'icon'> = {
    id: 'view-id',
    name: 'All People',
    objectMetadataId: 'metadata-id',
    icon: 'IconUser',
  };

  const mockObjectMetadataItem: ObjectMetadataItem = {
    id: 'metadata-id',
    nameSingular: 'person',
    namePlural: 'people',
  } as ObjectMetadataItem;

  const mockObjectRecord: ObjectRecord = {
    __typename: 'ObjectRecord',
    id: 'record-id',
    name: 'John Doe',
  } as ObjectRecord;

  const mockObjectRecordIdentifier: ObjectRecordIdentifier = {
    id: 'record-id',
    name: 'John Doe',
    avatarUrl: 'https://example.com/avatar.jpg',
    avatarType: 'rounded',
    linkToShowPage: '/app/objects/people/record-id',
  };

  const mockRelationField: FieldMetadataItem = {
    name: 'person',
    type: FieldMetadataType.RELATION,
    relation: {
      targetObjectMetadata: {
        nameSingular: 'person',
      },
    },
  } as FieldMetadataItem;

  const getObjectRecordIdentifierByNameSingular = jest.fn(
    (
      record: ObjectRecord,
      objectNameSingular: string,
    ): ObjectRecordIdentifier => {
      if (objectNameSingular === 'person') {
        return mockObjectRecordIdentifier;
      }
      return {
        id: record.id,
        name: 'Unknown',
      };
    },
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process favorite with viewId', () => {
    const favorite = {
      id: 'favorite-id',
      viewId: 'view-id',
      position: 1,
    } as unknown as Favorite;

    const result = sortFavorites(
      [favorite],
      [],
      getObjectRecordIdentifierByNameSingular,
      true,
      [mockView],
      [mockObjectMetadataItem],
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'favorite-id',
      objectNameSingular: 'view',
      Icon: 'IconUser',
    });
  });

  it('should handle favorite with viewId when view is not found', () => {
    const favorite = {
      id: 'favorite-id',
      viewId: 'non-existent-view-id',
      position: 1,
    } as unknown as Favorite;

    const result = sortFavorites(
      [favorite],
      [],
      getObjectRecordIdentifierByNameSingular,
      true,
      [],
      [mockObjectMetadataItem],
    );

    expect(result).toHaveLength(1);
    expect(result[0].objectNameSingular).toBe('view');
  });

  it('should process favorite with relation field', () => {
    const favorite = {
      id: 'favorite-id',
      person: mockObjectRecord,
      position: 2,
    } as unknown as Favorite;

    const result = sortFavorites(
      [favorite],
      [mockRelationField],
      getObjectRecordIdentifierByNameSingular,
      true,
      [],
      [],
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'favorite-id',
      objectNameSingular: 'person',
      labelIdentifier: 'John Doe',
    });
  });

  it('should return empty link when hasLinkToShowPage is false', () => {
    const favorite = {
      id: 'favorite-id',
      person: mockObjectRecord,
      position: 2,
    } as unknown as Favorite;

    const result = sortFavorites(
      [favorite],
      [mockRelationField],
      getObjectRecordIdentifierByNameSingular,
      false,
      [],
      [],
    );

    expect(result).toHaveLength(1);
    expect(result[0].link).toBe('');
  });

  it('should sort favorites by position', () => {
    const favorites = [
      {
        id: 'favorite-3',
        viewId: 'view-id',
        position: 3,
      },
      {
        id: 'favorite-1',
        viewId: 'view-id',
        position: 1,
      },
      {
        id: 'favorite-2',
        viewId: 'view-id',
        position: 2,
      },
    ] as unknown as Favorite[];

    const result = sortFavorites(
      favorites,
      [],
      getObjectRecordIdentifierByNameSingular,
      true,
      [mockView],
      [mockObjectMetadataItem],
    );

    expect(result).toHaveLength(3);
    expect(result[0].id).toBe('favorite-1');
    expect(result[1].id).toBe('favorite-2');
    expect(result[2].id).toBe('favorite-3');
  });

  it('should filter out favorites with no viewId and no relation fields', () => {
    const favorite = {
      id: 'favorite-id',
      position: 1,
    } as unknown as Favorite;

    const result = sortFavorites(
      [favorite],
      [],
      getObjectRecordIdentifierByNameSingular,
      true,
      [],
      [],
    );

    expect(result).toHaveLength(0);
  });
});
