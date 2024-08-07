import { gql } from '@apollo/client';
import { AvatarType } from 'twenty-ui';

import { PERSON_FRAGMENT } from '@/object-record/hooks/__mocks__/personFragment';
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
    recordId: '2',
    position: 0,
    avatarType: 'squared',
    avatarUrl: undefined,
    labelIdentifier: 'ABC Corp',
    link: '/object/company/2',
  },
  {
    id: '2',
    recordId: '4',
    position: 1,
    avatarType: 'squared',
    avatarUrl: undefined,
    labelIdentifier: 'Company Test',
    link: '/object/company/4',
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
        taskId
        myCustomObjectId
        workspaceMemberId
        workspaceMember {
          __typename
          userId
          updatedAt
          dateFormat
          id
          locale
          avatarUrl
          timeZone
          name {
            firstName
            lastName
          }
          userEmail
          createdAt
          timeFormat
          colorScheme
        }
        companyId
        myCustomObject {
          __typename
          createdBy {
            source
            workspaceMemberId
            name
          }
          position
          updatedAt
          name
          myCustomField
          id
          createdAt
        }
        updatedAt
        id
        opportunity {
          __typename
          companyId
          closeDate
          stage
          createdBy {
            source
            workspaceMemberId
            name
          }
          id
          updatedAt
          name
          createdAt
          pointOfContactId
          amount {
            amountMicros
            currencyCode
          }
          position
        }
        noteId
        note {
          __typename
          createdBy {
            source
            workspaceMemberId
            name
          }
          position
          body
          updatedAt
          createdAt
          title
          id
        }
        personId
        task {
          __typename
          status
          assigneeId
          updatedAt
          body
          createdAt
          dueAt
          position
          id
          title
          createdBy {
            source
            workspaceMemberId
            name
          }
        }
        opportunityId
        position
        createdAt
        company {
          __typename
          id
          visaSponsorship
          createdBy {
            source
            workspaceMemberId
            name
          }
          domainName {
            primaryLinkUrl
            primaryLinkLabel
            secondaryLinks
          }
          introVideo {
            primaryLinkUrl
            primaryLinkLabel
            secondaryLinks
          }
          position
          annualRecurringRevenue {
            amountMicros
            currencyCode
          }
          employees
          linkedinLink {
            primaryLinkUrl
            primaryLinkLabel
            secondaryLinks
          }
          workPolicy
          address {
            addressStreet1
            addressStreet2
            addressCity
            addressState
            addressCountry
            addressPostcode
            addressLat
            addressLng
          }
          name
          updatedAt
          xLink {
            primaryLinkUrl
            primaryLinkLabel
            secondaryLinks
          }
          myCustomField
          createdAt
          accountOwnerId
          tagline
          idealCustomerProfile
        }
        person {
          ${PERSON_FRAGMENT}
        }
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
        taskId
        myCustomObjectId
        workspaceMemberId
        workspaceMember {
          __typename
          userId
          updatedAt
          dateFormat
          id
          locale
          avatarUrl
          timeZone
          name {
            firstName
            lastName
          }
          userEmail
          createdAt
          timeFormat
          colorScheme
        }
        companyId
        myCustomObject {
          __typename
          createdBy {
            source
            workspaceMemberId
            name
          }
          position
          updatedAt
          name
          myCustomField
          id
          createdAt
        }
        updatedAt
        id
        opportunity {
          __typename
          companyId
          closeDate
          stage
          createdBy {
            source
            workspaceMemberId
            name
          }
          id
          updatedAt
          name
          createdAt
          pointOfContactId
          amount {
            amountMicros
            currencyCode
          }
          position
        }
        noteId
        note {
          __typename
          createdBy {
            source
            workspaceMemberId
            name
          }
          position
          body
          updatedAt
          createdAt
          title
          id
        }
        personId
        task {
          __typename
          status
          assigneeId
          updatedAt
          body
          createdAt
          dueAt
          position
          id
          title
          createdBy {
            source
            workspaceMemberId
            name
          }
        }
        opportunityId
        position
        createdAt
        company {
          __typename
          id
          visaSponsorship
          createdBy {
            source
            workspaceMemberId
            name
          }
          domainName {
            primaryLinkUrl
            primaryLinkLabel
            secondaryLinks
          }
          introVideo {
            primaryLinkUrl
            primaryLinkLabel
            secondaryLinks
          }
          position
          annualRecurringRevenue {
            amountMicros
            currencyCode
          }
          employees
          linkedinLink {
            primaryLinkUrl
            primaryLinkLabel
            secondaryLinks
          }
          workPolicy
          address {
            addressStreet1
            addressStreet2
            addressCity
            addressState
            addressCountry
            addressPostcode
            addressLat
            addressLng
          }
          name
          updatedAt
          xLink {
            primaryLinkUrl
            primaryLinkLabel
            secondaryLinks
          }
          myCustomField
          createdAt
          accountOwnerId
          tagline
          idealCustomerProfile
        }
        person {
          ${PERSON_FRAGMENT}
        }
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
