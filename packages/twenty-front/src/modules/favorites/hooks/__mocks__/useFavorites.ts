import { gql } from '@apollo/client';
import { AvatarType } from 'twenty-ui';

import { ColorScheme } from '@/workspace-member/types/WorkspaceMember';

export const mockId = '8f3b2121-f194-4ba4-9fbf-2d5a37126806';
export const favoriteId = 'f088c8c9-05d2-4276-b065-b863cc7d0b33';
const favoriteTargetObjectId = 'f2d8b9e9-7932-4065-bc09-baf12388b75d';
export const favoriteTargetObjectRecord = {
  id: favoriteTargetObjectId,
  __typename: 'Person',
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
    favoriteFolderId: 'folder-1',
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

const createQuery = gql`
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
 __typename
}
annualRecurringRevenue {
 amountMicros
 currencyCode
 __typename
}
createdAt
createdBy {
 source
 workspaceMemberId
 name
 __typename
}
deletedAt
domainName {
 primaryLinkUrl
 primaryLinkLabel
 secondaryLinks
 __typename
}
employees
id
idealCustomerProfile
introVideo {
 primaryLinkUrl
 primaryLinkLabel
 secondaryLinks
 __typename
}
linkedinLink {
 primaryLinkUrl
 primaryLinkLabel
 secondaryLinks
 __typename
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
 __typename
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
id
note {
__typename
body
createdAt
createdBy {
 source
 workspaceMemberId
 name
 __typename
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
 __typename
}
closeDate
companyId
createdAt
createdBy {
 source
 workspaceMemberId
 name
 __typename
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
 __typename
}
deletedAt
emails {
 primaryEmail
 additionalEmails
 __typename
}
id
intro
jobTitle
linkedinLink {
 primaryLinkUrl
 primaryLinkLabel
 secondaryLinks
 __typename
}
name {
 firstName
 lastName
 __typename
}
performanceRating
phones {
 primaryPhoneNumber
 primaryPhoneCountryCode
 additionalPhones
 __typename
}
position
updatedAt
whatsapp {
 primaryPhoneNumber
 primaryPhoneCountryCode
 additionalPhones
 __typename
}
workPreference
xLink {
 primaryLinkUrl
 primaryLinkLabel
 secondaryLinks
 __typename
}
}
personId
position
rocket {
__typename
createdAt
createdBy {
 source
 workspaceMemberId
 name
 __typename
}
deletedAt
id
name
position
updatedAt
}
rocketId
task {
__typename
assigneeId
body
createdAt
createdBy {
 source
 workspaceMemberId
 name
 __typename
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
kanbanFieldMetadataId
key
name
objectMetadataId
position
type
updatedAt
}
viewId
workflow {
__typename
createdAt
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
createdAt
createdBy {
 source
 workspaceMemberId
 name
 __typename
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
workspaceMember {
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
 __typename
}
timeFormat
timeZone
updatedAt
userEmail
userId
}
workspaceMemberId
}
}
`

export const mocks = [
  {
    request: {
      query: createQuery,
      variables: {
        input: {
          id: mockId,
          personId: favoriteTargetObjectId,
          position: 3,
          workspaceMemberId: '1',
          favoriteFolderId: undefined,
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
      query: createQuery,
      variables: {
        input: {
          id: mockId,
          personId: favoriteTargetObjectId,
          position: 1,
          workspaceMemberId: '1',
          favoriteFolderId: 'folder-1',
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
            __typename
            id
            deletedAt
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
       mutation UpdateOneFavorite($idToUpdate: ID!, $input: FavoriteUpdateInput!) {
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
        __typename
      }
      annualRecurringRevenue {
        amountMicros
        currencyCode
        __typename
      }
      createdAt
      createdBy {
        source
        workspaceMemberId
        name
        __typename
      }
      deletedAt
      domainName {
        primaryLinkUrl
        primaryLinkLabel
        secondaryLinks
        __typename
      }
      employees
      id
      idealCustomerProfile
      introVideo {
        primaryLinkUrl
        primaryLinkLabel
        secondaryLinks
        __typename
      }
      linkedinLink {
        primaryLinkUrl
        primaryLinkLabel
        secondaryLinks
        __typename
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
        __typename
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
    id
    note {
      __typename
      body
      createdAt
      createdBy {
        source
        workspaceMemberId
        name
        __typename
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
        __typename
      }
      closeDate
      companyId
      createdAt
      createdBy {
        source
        workspaceMemberId
        name
        __typename
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
        __typename
      }
      deletedAt
      emails {
        primaryEmail
        additionalEmails
        __typename
      }
      id
      intro
      jobTitle
      linkedinLink {
        primaryLinkUrl
        primaryLinkLabel
        secondaryLinks
        __typename
      }
      name {
        firstName
        lastName
        __typename
      }
      performanceRating
      phones {
        primaryPhoneNumber
        primaryPhoneCountryCode
        additionalPhones
        __typename
      }
      position
      updatedAt
      whatsapp {
        primaryPhoneNumber
        primaryPhoneCountryCode
        additionalPhones
        __typename
      }
      workPreference
      xLink {
        primaryLinkUrl
        primaryLinkLabel
        secondaryLinks
        __typename
      }
    }
    personId
    position
    rocket {
      __typename
      createdAt
      createdBy {
        source
        workspaceMemberId
        name
        __typename
      }
      deletedAt
      id
      name
      position
      updatedAt
    }
    rocketId
    task {
      __typename
      assigneeId
      body
      createdAt
      createdBy {
        source
        workspaceMemberId
        name
        __typename
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
      kanbanFieldMetadataId
      key
      name
      objectMetadataId
      position
      type
      updatedAt
    }
    viewId
    workflow {
      __typename
      createdAt
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
      createdAt
      createdBy {
        source
        workspaceMemberId
        name
        __typename
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
    workspaceMember {
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
        __typename
      }
      timeFormat
      timeZone
      updatedAt
      userEmail
      userId
    }
    workspaceMemberId
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

export const mockFolders = [
  {
    id: 'folder-1',
    name: 'Important',
    workspaceMemberId: mockWorkspaceMember.id,
    position: 0,
  },
];
