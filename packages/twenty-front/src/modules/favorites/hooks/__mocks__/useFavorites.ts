import { gql } from '@apollo/client';

import { Favorite } from '@/favorites/types/Favorite';
import { generateCreateOneRecordMutation } from '@/object-metadata/utils/generateCreateOneRecordMutation';
import { generateUpdateOneRecordMutation } from '@/object-metadata/utils/generateUpdateOneRecordMutation';
import { ColorScheme } from '@/workspace-member/types/WorkspaceMember';
import { AvatarType } from 'twenty-ui/display';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

export const mockId = '8f3b2121-f194-4ba4-9fbf-2d5a37126806';
export const favoriteId = 'f088c8c9-05d2-4276-b065-b863cc7d0b33';
const favoriteTargetObjectId = 'f2d8b9e9-7932-4065-bc09-baf12388b75d';
export const favoriteTargetObjectRecord = {
  id: favoriteTargetObjectId,
  __typename: 'Person',
};

export const initialFavorites: Favorite[] = [
  {
    __typename: 'Favorite',
    id: '1',
    position: 0,
    key: mockId,
    labelIdentifier: 'favoriteLabel',
    avatarUrl: 'example.com',
    avatarType: 'squared' as AvatarType,
    link: 'example.com',
    recordId: '1',
    person: { id: '1', name: 'John Doe' },
    company: { id: '2', name: 'ABC Corp' },
    forWorkspaceMemberId: '1',
    favoriteFolderId: '1',
  },
  {
    __typename: 'Favorite',
    id: '2',
    position: 1,
    key: mockId,
    labelIdentifier: 'favoriteLabel',
    avatarUrl: 'example.com',
    avatarType: 'squared' as AvatarType,
    link: 'example.com',
    recordId: '1',
    person: { id: '3', name: 'Jane Doe' },
    company: { id: '4', name: 'Company Test' },
    forWorkspaceMemberId: '1',
    favoriteFolderId: '1',
  },
  {
    __typename: 'Favorite',
    id: '3',
    position: 2,
    key: mockId,
    labelIdentifier: 'favoriteLabel',
    avatarUrl: 'example.com',
    company: { id: '5', name: 'Company Test 2' },
    avatarType: 'squared' as AvatarType,
    link: 'example.com',
    recordId: '1',
    forWorkspaceMemberId: '1',
    favoriteFolderId: '1',
  },
];

export const sortedFavorites = [
  {
    id: '1',
    recordId: '1',
    position: 0,
    avatarType: 'rounded',
    avatarUrl: '',
    labelIdentifier: ' ',
    link: '/object/person/1',
    objectNameSingular: 'person',
    forWorkspaceMemberId: '1',
    favoriteFolderId: '1',
    __typename: 'Favorite',
  },
  {
    id: '2',
    recordId: '3',
    position: 1,
    avatarType: 'rounded',
    avatarUrl: '',
    labelIdentifier: ' ',
    link: '/object/person/3',
    objectNameSingular: 'person',
    forWorkspaceMemberId: '1',
    favoriteFolderId: '1',
    __typename: 'Favorite',
  },
  {
    __typename: 'Favorite',
    avatarType: 'squared',
    avatarUrl: undefined,
    favoriteFolderId: '1',
    forWorkspaceMemberId: '1',
    id: '3',
    labelIdentifier: 'Company Test 2',
    link: '/object/company/5',
    objectNameSingular: 'company',
    position: 2,
    recordId: '5',
  },
];

const favoriteObjectMetadataItem = getMockObjectMetadataItemOrThrow('favorite')

const UPDATE_ONE_FAVORITE_MUTATION = generateUpdateOneRecordMutation(
  {
    objectMetadataItem: favoriteObjectMetadataItem,
    objectMetadataItems: generatedMockObjectMetadataItems,
    computeReferences: false,
    objectPermissionsByObjectMetadataId: {},
  },
)

const CREATE_ONE_FAVORITE_MUTATION = generateCreateOneRecordMutation(
  {
    objectMetadataItem: favoriteObjectMetadataItem,
    objectMetadataItems: generatedMockObjectMetadataItems,
    objectPermissionsByObjectMetadataId: {},
  },
)


export const mocks = [
  {
    request: {
      query: CREATE_ONE_FAVORITE_MUTATION,
      variables: {
        input: {
          personId: favoriteTargetObjectId,
          position: 1,
          forWorkspaceMemberId: '1',
          favoriteFolderId: undefined,
          id: mockId,
        },
      },
    },
    result: jest.fn(() => ({
      data: {
        createFavorite: {
          __typename: 'Favorite',
          id: favoriteId,
          position: 1,
        },
      },
    })),
  },
  {
    request: {
      query: gql`
        mutation DeleteOneFavorite($idToDelete: UUID!) {
          deleteFavorite(id: $idToDelete) {
            __typename
            deletedAt
            id
          }
        }
      `,
      variables: { idToDelete: favoriteId },
    },
    result: jest.fn(() => ({
      data: {
        deleteFavorite: {
          __typename: 'Favorite',
          id: favoriteId,
          deletedAt: new Date().toISOString(),
        },
      },
    })),
  },
  {
    request: {
      query: UPDATE_ONE_FAVORITE_MUTATION,
      variables: {
        idToUpdate: '1',
        input: {
          position: 3,
        },
      },
    },
    result: jest.fn(() => ({
      data: {
        updateFavorite: {
          __typename: 'Favorite',
          id: favoriteId,
          position: 3,
        },
      },
    })),
  },

  // Mock for folder move
  {
    request: {
      query: UPDATE_ONE_FAVORITE_MUTATION,
      variables: {
        idToUpdate: '1',
        input: {
          position: 1,
          favoriteFolderId: '2',
        },
      },
    },
    result: jest.fn(() => ({
      data: {
        updateFavorite: {
          __typename: 'Favorite',
          id: favoriteId,
          position: 1,
          favoriteFolderId: '2',
        },
      },
    })),
  },

  // Mock for orphan favorites
  {
    request: {
      query: UPDATE_ONE_FAVORITE_MUTATION,
      variables: {
        idToUpdate: '1',
        input: {
          position: 1,
          favoriteFolderId: null,
        },
      },
    },
    result: jest.fn(() => ({
      data: {
        updateFavorite: {
          __typename: 'Favorite',
          id: favoriteId,
          position: 1,
          favoriteFolderId: null,
        },
      },
    })),
  },
];

export const mockWorkspaceMember = {
  id: '1',
  name: {
    firstName: 'First',
    lastName: 'Last',
  },
  avatarUrl: '',
  locale: 'en-US',
  colorScheme: 'Dark' as ColorScheme,
  createdAt: '',
  updatedAt: '',
  userId: '1',
  userEmail: 'userEmail',
};
