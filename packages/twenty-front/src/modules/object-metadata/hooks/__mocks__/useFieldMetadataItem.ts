import { gql } from '@apollo/client';
import { FieldMetadataType } from '~/generated/graphql';

export const FIELD_METADATA_ID = '2c43466a-fe9e-4005-8d08-c5836067aa6c';
export const FIELD_RELATION_METADATA_ID =
  '4da0302d-358a-45cd-9973-9f92723ed3c1';

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
        isUnique
        isNullable
        createdAt
        updatedAt
        settings
        applicationId
        object {
          id
        }
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
        applicationId
        object {
          id
        }
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
        isUnique
        isNullable
        createdAt
        updatedAt
        settings
        defaultValue
        options
        isLabelSyncedWithName
        applicationId
        object {
          id
        }
      }
    }
  `,
};

export const objectMetadataId = '25611fce-6637-4089-b0ca-91afeec95784';

export const variables = {
  deleteMetadataField: { idToDelete: FIELD_METADATA_ID },
  deleteMetadataFieldRelation: { idToDelete: FIELD_RELATION_METADATA_ID },
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
        isUnique: undefined,
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
  applicationId: null,
};

const fieldRelationResponseData = {
  ...defaultResponseData,
  id: FIELD_RELATION_METADATA_ID,
  type: FieldMetadataType.RELATION,
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
      canAccessFullAdminPanel: false,
      canImpersonate: false,
      supportUserHash: null,
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
      currentUserWorkspace: {
        permissionFlags: ['DATA_MODEL'],
      },
      currentWorkspace: {
        id: 'test-workspace-id',
        displayName: 'Test Workspace',
        logo: null,
        inviteHash: 'test-hash',
        allowImpersonation: false,
        activationStatus: 'active',
        isPublicInviteLinkEnabled: false,
        hasValidEnterpriseKey: false,
        isGoogleAuthEnabled: true,
        isMicrosoftAuthEnabled: false,
        isPasswordAuthEnabled: true,
        subdomain: 'test',
        customDomain: null,
        workspaceUrls: {
          customUrl: undefined,
          subdomainUrl: 'https://test.twenty.com/',
        },
        featureFlags: [],
        metadataVersion: 1,
        currentBillingSubscription: null,
        workspaceMembersCount: 1,
        defaultRole:  {
          id: 'default-role-id',
          label: 'Default Role',
          description: 'Default Role Description',
          canUpdateAllSettings: true,
          isEditable: true,
          canReadAllObjectRecords: true,
          canUpdateAllObjectRecords: true,
          canSoftDeleteAllObjectRecords: true,
          canDestroyAllObjectRecords: true,
        }
      },
      currentBillingSubscription: null,
      billingSubscriptions: [],
      workspaces: [],
      userVars: null,
    },
  },
};
