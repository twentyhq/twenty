import { gql } from '@apollo/client';

import { AvatarType } from '@/users/components/Avatar';
import { ColorScheme } from '@/workspace-member/types/WorkspaceMember';

export const mockId = '8f3b2121-f194-4ba4-9fbf-2d5a37126806';
export const favoriteId = 'f088c8c9-05d2-4276-b065-b863cc7d0b33';
const favoriteTargetObjectId = 'f2d8b9e9-7932-4065-bc09-baf12388b75d';
export const favoriteTargetObjectRecord = {
  id: favoriteTargetObjectId,
};

export const initialFavorites = [
  {
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
  },
  {
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
  },
  {
    id: '3',
    position: 2,
    key: mockId,
    labelIdentifier: 'favoriteLabel',
    avatarUrl: 'example.com',
    avatarType: 'squared' as AvatarType,
    link: 'example.com',
    recordId: '1',
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
  },
  {
    id: '2',
    recordId: '3',
    position: 1,
    avatarType: 'rounded',
    avatarUrl: '',
    labelIdentifier: ' ',
    link: '/object/person/3',
  },
  {
    id: '3',
    position: 2,
    key: '8f3b2121-f194-4ba4-9fbf-2d5a37126806',
    labelIdentifier: 'favoriteLabel',
    avatarUrl: 'example.com',
    avatarType: 'squared',
    link: 'example.com',
    recordId: '1',
  },
];

export const mocks = [
  {
    request: {
      query: gql`
        mutation CreateOneFavorite($input: FavoriteCreateInput!) {
          createFavorite(data: $input) {
        __typename
        id
        companyId
        createdAt
        personId
        person {
          __typename
          xLink {
            label
            url
          }
          id
          createdAt
          city
          email
          jobTitle
          name {
            firstName
            lastName
          }
          phone
          linkedinLink {
            label
            url
          }
          updatedAt
          avatarUrl
          companyId
        }
        position
        workspaceMemberId
        workspaceMember {
          __typename
          colorScheme
          name {
            firstName
            lastName
          }
          locale
          userId
          avatarUrl
          createdAt
          updatedAt
          id
        }
        company {
          __typename
          xLink {
            label
            url
          }
          linkedinLink {
            label
            url
          }
          domainName
          annualRecurringRevenue {
            amountMicros
            currencyCode
          }
          createdAt
          address
          updatedAt
          name
          accountOwnerId
          employees
          id
          idealCustomerProfile
        }
        updatedAt
      }
        }
      `,
      variables: {
        input: {
          id: mockId,
          personId: favoriteTargetObjectId,
          position: 4,
          workspaceMemberId: '1',
        },
      },
    },
    result: jest.fn(() => ({
      data: {
        createFavorite: {
          id: favoriteId,
        },
      },
    })),
  },
  {
    request: {
      query: gql`
        mutation DeleteOneFavorite($idToDelete: ID!) {
          deleteFavorite(id: $idToDelete) {
            id
          }
        }
      `,
      variables: { idToDelete: favoriteId },
    },
    result: jest.fn(() => ({
      data: {
        deleteFavorite: {
          id: favoriteId,
        },
      },
    })),
  },
  {
    request: {
      query: gql`
        mutation UpdateOneFavorite(
          $idToUpdate: ID!
          $input: FavoriteUpdateInput!
        ) {
          updateFavorite(id: $idToUpdate, data: $input) {
        __typename
        id
        companyId
        createdAt
        personId
        person {
          __typename
          xLink {
            label
            url
          }
          id
          createdAt
          city
          email
          jobTitle
          name {
            firstName
            lastName
          }
          phone
          linkedinLink {
            label
            url
          }
          updatedAt
          avatarUrl
          companyId
        }
        position
        workspaceMemberId
        workspaceMember {
          __typename
          colorScheme
          name {
            firstName
            lastName
          }
          locale
          userId
          avatarUrl
          createdAt
          updatedAt
          id
        }
        company {
          __typename
          xLink {
            label
            url
          }
          linkedinLink {
            label
            url
          }
          domainName
          annualRecurringRevenue {
            amountMicros
            currencyCode
          }
          createdAt
          address
          updatedAt
          name
          accountOwnerId
          employees
          id
          idealCustomerProfile
        }
        updatedAt
      }
        }
      `,
      variables: {
        idToUpdate: '1',
        input: {
          position: 2,
        },
      },
    },
    result: jest.fn(() => ({
      data: {
        updateFavorite: {
          id: favoriteId,
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
};
