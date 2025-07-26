import { gql } from '@apollo/client';

import { Favorite } from '@/favorites/types/Favorite';
import { ColorScheme } from '@/workspace-member/types/WorkspaceMember';
import { AvatarType } from 'twenty-ui/display';

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

const UPDATE_ONE_FAVORITE_MUTATION = gql`
  mutation UpdateOneFavorite($idToUpdate: UUID!, $input: FavoriteUpdateInput!) {
      updateFavorite(id: $idToUpdate, data: $input) {
        __typename
        company {
          __typename
          accountOwnerId
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
          annualRecurringRevenue {
            amountMicros
            currencyCode
          }
          createdAt
          createdBy {
            source
            workspaceMemberId
            name
            context
          }
          deletedAt
          domainName {
            primaryLinkUrl
            primaryLinkLabel
            secondaryLinks
          }
          employees
          id
          idealCustomerProfile
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
          name
          position
          tagline
          updatedAt
          visaSponsorship
          workPolicy
          xLink {
            primaryLinkUrl
            primaryLinkLabel
            secondaryLinks
          }
        }
        companyId
        createdAt
        deletedAt
        favoriteFolder {
          __typename
          createdAt
          deletedAt
          id
          name
          position
          updatedAt
        }
        favoriteFolderId
        forWorkspaceMember {
          __typename
          avatarUrl
          colorScheme
          createdAt
          dateFormat
          deletedAt
          id
          locale
          name {
            firstName
            lastName
          }
          position
          timeFormat
          timeZone
          updatedAt
          userEmail
          userId
        }
        forWorkspaceMemberId
        id
        note {
          __typename
          bodyV2 {
            blocknote
            markdown
          }
          createdAt
          createdBy {
            source
            workspaceMemberId
            name
            context
          }
          deletedAt
          id
          position
          title
          updatedAt
        }
        noteId
        opportunity {
          __typename
          amount {
            amountMicros
            currencyCode
          }
          closeDate
          companyId
          createdAt
          createdBy {
            source
            workspaceMemberId
            name
            context
          }
          deletedAt
          id
          name
          pointOfContactId
          position
          stage
          updatedAt
        }
        opportunityId
        person {
          __typename
          avatarUrl
          city
          companyId
          createdAt
          createdBy {
            source
            workspaceMemberId
            name
            context
          }
          deletedAt
          emails {
            primaryEmail
            additionalEmails
          }
          id
          intro
          jobTitle
          linkedinLink {
            primaryLinkUrl
            primaryLinkLabel
            secondaryLinks
          }
          name {
            firstName
            lastName
          }
          performanceRating
          phones {
            primaryPhoneNumber
            primaryPhoneCountryCode
            primaryPhoneCallingCode
            additionalPhones
          }
          position
          updatedAt
          whatsapp {
            primaryPhoneNumber
            primaryPhoneCountryCode
            primaryPhoneCallingCode
            additionalPhones
          }
          workPreference
          xLink {
            primaryLinkUrl
            primaryLinkLabel
            secondaryLinks
          }
        }
        personId
        pet {
          __typename
          age
          averageCostOfKibblePerMonth {
            amountMicros
            currencyCode
          }
          bio
          birthday
          comments
          createdAt
          createdBy {
            source
            workspaceMemberId
            name
            context
          }
          deletedAt
          extraData
          id
          interestingFacts
          isGoodWithKids
          location {
            addressStreet1
            addressStreet2
            addressCity
            addressState
            addressCountry
            addressPostcode
            addressLat
            addressLng
          }
          makesOwnerThinkOf {
            firstName
            lastName
          }
          name
          pictures {
            primaryLinkUrl
            primaryLinkLabel
            secondaryLinks
          }
          position
          soundSwag
          species
          traits
          updatedAt
          vetEmail {
            primaryEmail
            additionalEmails
          }
          vetPhone {
            primaryPhoneNumber
            primaryPhoneCountryCode
            primaryPhoneCallingCode
            additionalPhones
          }
        }
        petId
        position
        rocket {
          __typename
          createdAt
          createdBy {
            source
            workspaceMemberId
            name
            context
          }
          deletedAt
          id
          name
          position
          updatedAt
        }
        rocketId
        surveyResult {
          __typename
          averageEstimatedNumberOfAtomsInTheUniverse
          comments
          createdAt
          createdBy {
            source
            workspaceMemberId
            name
            context
          }
          deletedAt
          id
          name
          participants
          percentageOfCompletion
          position
          score
          shortNotes
          updatedAt
        }
        surveyResultId
        task {
          __typename
          assigneeId
          bodyV2 {
            blocknote
            markdown
          }
          createdAt
          createdBy {
            source
            workspaceMemberId
            name
            context
          }
          deletedAt
          dueAt
          id
          position
          status
          title
          updatedAt
        }
        taskId
        updatedAt
        view {
          __typename
          createdAt
          deletedAt
          icon
          id
          isCompact
          kanbanAggregateOperation
          kanbanAggregateOperationFieldMetadataId
          kanbanFieldMetadataId
          key
          name
          objectMetadataId
          openRecordIn
          position
          type
          updatedAt
        }
        viewId
        workflow {
          __typename
          createdAt
          createdBy {
            source
            workspaceMemberId
            name
            context
          }
          deletedAt
          id
          lastPublishedVersionId
          name
          position
          statuses
          updatedAt
        }
        workflowId
        workflowRun {
          __typename
          context
          createdAt
          createdBy {
            source
            workspaceMemberId
            name
            context
          }
          deletedAt
          endedAt
          id
          name
          output
          position
          startedAt
          status
          updatedAt
          workflowId
          workflowVersionId
        }
        workflowRunId
        workflowVersion {
          __typename
          createdAt
          deletedAt
          id
          name
          position
          status
          steps
          trigger
          updatedAt
          workflowId
        }
        workflowVersionId
      }
    }
`;

export const mocks = [
  {
    request: {
      query: gql`
        mutation CreateOneFavorite($input: FavoriteCreateInput!) {
      createFavorite(data: $input) {
        __typename
        company {
          __typename
          accountOwnerId
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
          annualRecurringRevenue {
            amountMicros
            currencyCode
          }
          createdAt
          createdBy {
            source
            workspaceMemberId
            name
            context
          }
          deletedAt
          domainName {
            primaryLinkUrl
            primaryLinkLabel
            secondaryLinks
          }
          employees
          id
          idealCustomerProfile
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
          name
          position
          tagline
          updatedAt
          visaSponsorship
          workPolicy
          xLink {
            primaryLinkUrl
            primaryLinkLabel
            secondaryLinks
          }
        }
        companyId
        createdAt
        deletedAt
        favoriteFolder {
          __typename
          createdAt
          deletedAt
          id
          name
          position
          updatedAt
        }
        favoriteFolderId
        forWorkspaceMember {
          __typename
          avatarUrl
          colorScheme
          createdAt
          dateFormat
          deletedAt
          id
          locale
          name {
            firstName
            lastName
          }
          position
          timeFormat
          timeZone
          updatedAt
          userEmail
          userId
        }
        forWorkspaceMemberId
        id
        note {
          __typename
          bodyV2 {
            blocknote
            markdown
          }
          createdAt
          createdBy {
            source
            workspaceMemberId
            name
            context
          }
          deletedAt
          id
          position
          title
          updatedAt
        }
        noteId
        opportunity {
          __typename
          amount {
            amountMicros
            currencyCode
          }
          closeDate
          companyId
          createdAt
          createdBy {
            source
            workspaceMemberId
            name
            context
          }
          deletedAt
          id
          name
          pointOfContactId
          position
          stage
          updatedAt
        }
        opportunityId
        person {
          __typename
          avatarUrl
          city
          companyId
          createdAt
          createdBy {
            source
            workspaceMemberId
            name
            context
          }
          deletedAt
          emails {
            primaryEmail
            additionalEmails
          }
          id
          intro
          jobTitle
          linkedinLink {
            primaryLinkUrl
            primaryLinkLabel
            secondaryLinks
          }
          name {
            firstName
            lastName
          }
          performanceRating
          phones {
            primaryPhoneNumber
            primaryPhoneCountryCode
            primaryPhoneCallingCode
            additionalPhones
          }
          position
          updatedAt
          whatsapp {
            primaryPhoneNumber
            primaryPhoneCountryCode
            primaryPhoneCallingCode
            additionalPhones
          }
          workPreference
          xLink {
            primaryLinkUrl
            primaryLinkLabel
            secondaryLinks
          }
        }
        personId
        pet {
          __typename
          age
          averageCostOfKibblePerMonth {
            amountMicros
            currencyCode
          }
          bio
          birthday
          comments
          createdAt
          createdBy {
            source
            workspaceMemberId
            name
            context
          }
          deletedAt
          extraData
          id
          interestingFacts
          isGoodWithKids
          location {
            addressStreet1
            addressStreet2
            addressCity
            addressState
            addressCountry
            addressPostcode
            addressLat
            addressLng
          }
          makesOwnerThinkOf {
            firstName
            lastName
          }
          name
          pictures {
            primaryLinkUrl
            primaryLinkLabel
            secondaryLinks
          }
          position
          soundSwag
          species
          traits
          updatedAt
          vetEmail {
            primaryEmail
            additionalEmails
          }
          vetPhone {
            primaryPhoneNumber
            primaryPhoneCountryCode
            primaryPhoneCallingCode
            additionalPhones
          }
        }
        petId
        position
        rocket {
          __typename
          createdAt
          createdBy {
            source
            workspaceMemberId
            name
            context
          }
          deletedAt
          id
          name
          position
          updatedAt
        }
        rocketId
        surveyResult {
          __typename
          averageEstimatedNumberOfAtomsInTheUniverse
          comments
          createdAt
          createdBy {
            source
            workspaceMemberId
            name
            context
          }
          deletedAt
          id
          name
          participants
          percentageOfCompletion
          position
          score
          shortNotes
          updatedAt
        }
        surveyResultId
        task {
          __typename
          assigneeId
          bodyV2 {
            blocknote
            markdown
          }
          createdAt
          createdBy {
            source
            workspaceMemberId
            name
            context
          }
          deletedAt
          dueAt
          id
          position
          status
          title
          updatedAt
        }
        taskId
        updatedAt
        view {
          __typename
          createdAt
          deletedAt
          icon
          id
          isCompact
          kanbanAggregateOperation
          kanbanAggregateOperationFieldMetadataId
          kanbanFieldMetadataId
          key
          name
          objectMetadataId
          openRecordIn
          position
          type
          updatedAt
        }
        viewId
        workflow {
          __typename
          createdAt
          createdBy {
            source
            workspaceMemberId
            name
            context
          }
          deletedAt
          id
          lastPublishedVersionId
          name
          position
          statuses
          updatedAt
        }
        workflowId
        workflowRun {
          __typename
          context
          createdAt
          createdBy {
            source
            workspaceMemberId
            name
            context
          }
          deletedAt
          endedAt
          id
          name
          output
          position
          startedAt
          status
          updatedAt
          workflowId
          workflowVersionId
        }
        workflowRunId
        workflowVersion {
          __typename
          createdAt
          deletedAt
          id
          name
          position
          status
          steps
          trigger
          updatedAt
          workflowId
        }
        workflowVersionId
      }
    }
      `,
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
