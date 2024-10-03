import { gql } from '@apollo/client';
import { AvatarType } from 'twenty-ui';

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

export const sortedFavorites =  [
      {
       "avatarType": "rounded",
       "avatarUrl": "",
       "id": "1",
       "labelIdentifier": " ",
       "link": "/object/person/1",
       "position": 0,
       "recordId": "1",
       "workspaceMemberId": undefined,
     },
      {
       "avatarType": "rounded",
       "avatarUrl": "",
       "id": "2",
       "labelIdentifier": " ",
       "link": "/object/person/3",
       "position": 1,
       "recordId": "3",
       "workspaceMemberId": undefined,
     },
      {
       "avatarType": "squared",
       "avatarUrl": "example.com",
       "id": "3",
       "key": "8f3b2121-f194-4ba4-9fbf-2d5a37126806",
       "labelIdentifier": "favoriteLabel",
       "link": "example.com",
       "position": 2,
       "recordId": "1",
     },
   ]

export const mocks = [
  {
    request: {
      query: gql`
        mutation CreateOneFavorite($input: FavoriteCreateInput!) {
          createFavorite(data: $input) {
            __typename
        noteId
        taskId
        person {
          __typename
          name {
            firstName
            lastName
          }
          linkedinLink {
            primaryLinkUrl
            primaryLinkLabel
            secondaryLinks
          }
          deletedAt
          createdAt
          updatedAt
          jobTitle
          intro
          workPrefereance
          performanceRating
          xLink {
            primaryLinkUrl
            primaryLinkLabel
            secondaryLinks
          }
          city
          companyId
          phones {
            primaryPhoneNumber
            primaryPhoneCountryCode
            additionalPhones
          }
          createdBy {
            source
            workspaceMemberId
            name
          }
          id
          position
          emails {
            primaryEmail
            additionalEmails
          }
          avatarUrl
          whatsapp {
            primaryPhoneNumber
            primaryPhoneCountryCode
            additionalPhones
          }
        }
        task {
          __typename
          updatedAt
          createdAt
          deletedAt
          dueAt
          id
          status
          body
          createdBy {
            source
            workspaceMemberId
            name
          }
          assigneeId
          position
          title
        }
        rocketId
        viewId
        updatedAt
        workflowId
        personId
        workspaceMemberId
        note {
          __typename
          deletedAt
          id
          position
          updatedAt
          createdBy {
            source
            workspaceMemberId
            name
          }
          body
          title
          createdAt
        }
        createdAt
        view {
          __typename
          id
          type
          icon
          key
          isCompact
          kanbanFieldMetadataId
          objectMetadataId
          position
          createdAt
          deletedAt
          updatedAt
          name
        }
        opportunityId
        position
        deletedAt
        id
        companyId
        workflow {
          __typename
          deletedAt
          lastPublishedVersionId
          createdAt
          id
          statuses
          name
          position
          updatedAt
        }
        workspaceMember {
          __typename
          name {
            firstName
            lastName
          }
          avatarUrl
          userId
          createdAt
          timeZone
          id
          timeFormat
          updatedAt
          locale
          userEmail
          deletedAt
          colorScheme
          dateFormat
        }
        company {
          __typename
          updatedAt
          domainName {
            primaryLinkUrl
            primaryLinkLabel
            secondaryLinks
          }
          visaSponsorship
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
          position
          employees
          deletedAt
          accountOwnerId
          annualRecurringRevenue {
            amountMicros
            currencyCode
          }
          id
          name
          xLink {
            primaryLinkUrl
            primaryLinkLabel
            secondaryLinks
          }
          createdAt
          createdBy {
            source
            workspaceMemberId
            name
          }
          workPolicy
          introVideo {
            primaryLinkUrl
            primaryLinkLabel
            secondaryLinks
          }
          linkedinLink {
            primaryLinkUrl
            primaryLinkLabel
            secondaryLinks
          }
          tagline
          idealCustomerProfile
        }
        rocket {
          __typename
          createdBy {
            source
            workspaceMemberId
            name
          }
          updatedAt
          name
          position
          createdAt
          id
          deletedAt
        }
        opportunity {
          __typename
          createdBy {
            source
            workspaceMemberId
            name
          }
          amount {
            amountMicros
            currencyCode
          }
          stage
          position
          closeDate
          id
          name
          pointOfContactId
          companyId
          updatedAt
          deletedAt
          createdAt
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
        noteId
        taskId
        person {
          __typename
          name {
            firstName
            lastName
          }
          linkedinLink {
            primaryLinkUrl
            primaryLinkLabel
            secondaryLinks
          }
          deletedAt
          createdAt
          updatedAt
          jobTitle
          intro
          workPrefereance
          performanceRating
          xLink {
            primaryLinkUrl
            primaryLinkLabel
            secondaryLinks
          }
          city
          companyId
          phones {
            primaryPhoneNumber
            primaryPhoneCountryCode
            additionalPhones
          }
          createdBy {
            source
            workspaceMemberId
            name
          }
          id
          position
          emails {
            primaryEmail
            additionalEmails
          }
          avatarUrl
          whatsapp {
            primaryPhoneNumber
            primaryPhoneCountryCode
            additionalPhones
          }
        }
        task {
          __typename
          updatedAt
          createdAt
          deletedAt
          dueAt
          id
          status
          body
          createdBy {
            source
            workspaceMemberId
            name
          }
          assigneeId
          position
          title
        }
        rocketId
        viewId
        updatedAt
        workflowId
        personId
        workspaceMemberId
        note {
          __typename
          deletedAt
          id
          position
          updatedAt
          createdBy {
            source
            workspaceMemberId
            name
          }
          body
          title
          createdAt
        }
        createdAt
        view {
          __typename
          id
          type
          icon
          key
          isCompact
          kanbanFieldMetadataId
          objectMetadataId
          position
          createdAt
          deletedAt
          updatedAt
          name
        }
        opportunityId
        position
        deletedAt
        id
        companyId
        workflow {
          __typename
          deletedAt
          lastPublishedVersionId
          createdAt
          id
          statuses
          name
          position
          updatedAt
        }
        workspaceMember {
          __typename
          name {
            firstName
            lastName
          }
          avatarUrl
          userId
          createdAt
          timeZone
          id
          timeFormat
          updatedAt
          locale
          userEmail
          deletedAt
          colorScheme
          dateFormat
        }
        company {
          __typename
          updatedAt
          domainName {
            primaryLinkUrl
            primaryLinkLabel
            secondaryLinks
          }
          visaSponsorship
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
          position
          employees
          deletedAt
          accountOwnerId
          annualRecurringRevenue {
            amountMicros
            currencyCode
          }
          id
          name
          xLink {
            primaryLinkUrl
            primaryLinkLabel
            secondaryLinks
          }
          createdAt
          createdBy {
            source
            workspaceMemberId
            name
          }
          workPolicy
          introVideo {
            primaryLinkUrl
            primaryLinkLabel
            secondaryLinks
          }
          linkedinLink {
            primaryLinkUrl
            primaryLinkLabel
            secondaryLinks
          }
          tagline
          idealCustomerProfile
        }
        rocket {
          __typename
          createdBy {
            source
            workspaceMemberId
            name
          }
          updatedAt
          name
          position
          createdAt
          id
          deletedAt
        }
        opportunity {
          __typename
          createdBy {
            source
            workspaceMemberId
            name
          }
          amount {
            amountMicros
            currencyCode
          }
          stage
          position
          closeDate
          id
          name
          pointOfContactId
          companyId
          updatedAt
          deletedAt
          createdAt
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
