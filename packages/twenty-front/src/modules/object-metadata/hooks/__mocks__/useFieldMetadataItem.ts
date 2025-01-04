import { gql } from '@apollo/client';
import { FieldMetadataType } from '~/generated/graphql';

export const FIELD_METADATA_ID = '2c43466a-fe9e-4005-8d08-c5836067aa6c';
export const FIELD_RELATION_METADATA_ID =
  '4da0302d-358a-45cd-9973-9f92723ed3c1';
export const RELATION_METADATA_ID = 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6';

export const queries = {
  deleteMetadataField: gql`
    mutation DeleteOneFieldMetadataItem($idToDelete: UUID!) {
      deleteOneField(input: { id: $idToDelete }) {
        id
        type
        name
        label
        description
        icon
        isCustom
        isActive
        isNullable
        createdAt
        updatedAt
        settings
      }
    }
  `,
  findManyViewsQuery: gql`
    query FindManyViews($filter: ViewFilterInput, $orderBy: [ViewOrderByInput], $lastCursor: String, $limit: Int) {
        views(filter: $filter, orderBy: $orderBy, first: $limit, after: $lastCursor) {
          edges {
            node {
              __typename
              id
              viewGroups {
                edges {
                  node {
                    __typename
                    fieldMetadataId
                    fieldValue
                    id
                    isVisible
                    position
                  }
                }
              }
            }
            cursor
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
          totalCount
        }
      }`,
  deleteMetadataFieldRelation: gql`
    mutation DeleteOneRelationMetadataItem($idToDelete: UUID!) {
      deleteOneRelation(input: { id: $idToDelete }) {
        id
      }
    }
  `,
  activateMetadataField: gql`
    mutation UpdateOneFieldMetadataItem(
      $idToUpdate: UUID!
      $updatePayload: UpdateFieldInput!
    ) {
      updateOneField(input: { id: $idToUpdate, update: $updatePayload }) {
        id
        type
        name
        label
        description
        icon
        isCustom
        isActive
        isNullable
        createdAt
        updatedAt
        settings
        isLabelSyncedWithName
      }
    }
  `,
  createMetadataField: gql`
    mutation CreateOneFieldMetadataItem($input: CreateOneFieldMetadataInput!) {
      createOneField(input: $input) {
        id
        type
        name
        label
        description
        icon
        isCustom
        isActive
        isNullable
        createdAt
        updatedAt
        settings
        defaultValue
        options
      }
    }
  `,
  getCurrentUser: gql`
    query GetCurrentUser {
      currentUser {
        ...UserQueryFragment
      }
    }

    fragment UserQueryFragment on User {
      id
      firstName
      lastName
      email
      canImpersonate
      supportUserHash
      analyticsTinybirdJwts {
        getWebhookAnalytics
        getPageviewsAnalytics
        getUsersAnalytics
        getServerlessFunctionDuration
        getServerlessFunctionSuccessRate
        getServerlessFunctionErrorCount
      }
      onboardingStatus
      workspaceMember {
        ...WorkspaceMemberQueryFragment
      }
      workspaceMembers {
        ...WorkspaceMemberQueryFragment
      }
      currentWorkspace {
        id
        displayName
        logo
        domainName
        inviteHash
        allowImpersonation
        activationStatus
        isPublicInviteLinkEnabled
        isGoogleAuthEnabled
        isMicrosoftAuthEnabled
        isPasswordAuthEnabled
        subdomain
        hasValidEntrepriseKey
        featureFlags {
          id
          key
          value
          workspaceId
        }
        metadataVersion
        currentBillingSubscription {
          id
          status
          interval
        }
        workspaceMembersCount
      }
      workspaces {
        workspace {
          id
          logo
          displayName
          domainName
          subdomain
        }
      }
      userVars
    }

    fragment WorkspaceMemberQueryFragment on WorkspaceMember {
      id
      name {
        firstName
        lastName
      }
      colorScheme
      avatarUrl
      locale
      timeZone
      dateFormat
      timeFormat
    }
  `,
};

export const objectMetadataId = '25611fce-6637-4089-b0ca-91afeec95784';

export const variables = {
  deleteMetadataField: { idToDelete: FIELD_METADATA_ID },
  deleteMetadataFieldRelation: { idToDelete: RELATION_METADATA_ID },
  activateMetadataField: {
    idToUpdate: FIELD_METADATA_ID,
    updatePayload: { isActive: true },
  },
  createMetadataField: {
    input: {
      field: {
        defaultValue: undefined,
        description: null,
        icon: undefined,
        label: 'fieldLabel',
        name: 'fieldName',
        options: undefined,
        settings: undefined,
        isLabelSyncedWithName: true,
        objectMetadataId,
        type: 'TEXT',
      },
    },
  },
  deactivateMetadataField: {
    idToUpdate: FIELD_METADATA_ID,
    updatePayload: { isActive: false, label: undefined },
  },
};

const defaultResponseData = {
  id: FIELD_METADATA_ID,
  type: 'type',
  name: 'name',
  label: 'label',
  description: 'description',
  icon: 'icon',
  isCustom: false,
  isActive: true,
  isNullable: false,
  createdAt: '1977-09-28T13:56:55.157Z',
  updatedAt: '1996-10-10T08:27:57.117Z',
  settings: undefined,
};

const fieldRelationResponseData = {
  ...defaultResponseData,
  id: FIELD_RELATION_METADATA_ID,
  type: FieldMetadataType.Relation,
};

export const responseData = {
  default: defaultResponseData,
  fieldRelation: fieldRelationResponseData,
  createMetadataField: {
    ...defaultResponseData,
    defaultValue: '',
    options: [],
  },
  getCurrentUser: {
    currentUser: {
      id: 'test-user-id',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      canImpersonate: false,
      supportUserHash: null,
      analyticsTinybirdJwts: {
        getWebhookAnalytics: null,
        getPageviewsAnalytics: null,
        getUsersAnalytics: null,
        getServerlessFunctionDuration: null,
        getServerlessFunctionSuccessRate: null,
        getServerlessFunctionErrorCount: null,
      },
      onboardingStatus: 'completed',
      workspaceMember: {
        id: 'test-workspace-member-id',
        name: {
          firstName: 'Test',
          lastName: 'User',
        },
        colorScheme: 'light',
        avatarUrl: null,
        locale: 'en',
        timeZone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '24',
      },
      workspaceMembers: [],
      currentWorkspace: {
        id: 'test-workspace-id',
        displayName: 'Test Workspace',
        logo: null,
        domainName: 'test',
        inviteHash: 'test-hash',
        allowImpersonation: false,
        activationStatus: 'active',
        isPublicInviteLinkEnabled: false,
        hasValidEntrepriseKey: false,
        isGoogleAuthEnabled: true,
        isMicrosoftAuthEnabled: false,
        isPasswordAuthEnabled: true,
        subdomain: 'test',
        featureFlags: [],
        metadataVersion: 1,
        currentBillingSubscription: null,
        workspaceMembersCount: 1,
      },
      workspaces: [],
      userVars: null,
    },
  },
};
