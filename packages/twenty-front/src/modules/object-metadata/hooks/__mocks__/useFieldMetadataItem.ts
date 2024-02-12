import { gql } from '@apollo/client';

const baseFields = `
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
`;

export const queries = {
  eraseMetadataField: gql`
    mutation DeleteOneFieldMetadataItem($idToDelete: ID!) {
      deleteOneField(input: { id: $idToDelete }) {
        ${baseFields}
      }
    }
  `,
  activateMetadataField: gql`
    mutation UpdateOneFieldMetadataItem(
      $idToUpdate: ID!
      $updatePayload: UpdateFieldInput!
    ) {
      updateOneField(input: { id: $idToUpdate, update: $updatePayload }) {
        ${baseFields}
      }
    }
  `,
  createMetadataField: gql`
    mutation CreateOneFieldMetadataItem($input: CreateOneFieldMetadataInput!) {
      createOneField(input: $input) {
        ${baseFields}
        defaultValue
        options
      }
    }
  `,
};

const fieldId = '2c43466a-fe9e-4005-8d08-c5836067aa6c';
export const objectMetadataId = '25611fce-6637-4089-b0ca-91afeec95784';

export const variables = {
  eraseMetadataField: { idToDelete: fieldId },
  activateMetadataField: {
    idToUpdate: fieldId,
    updatePayload: { isActive: true, label: undefined },
  },
  createMetadataField: {
    input: {
      field: {
        defaultValue: undefined,
        description: null,
        icon: undefined,
        label: 'fieldLabel',
        name: 'fieldLabel',
        options: undefined,
        objectMetadataId,
        type: 'TEXT',
      },
    },
  },
  disableMetadataField: {
    idToUpdate: fieldId,
    updatePayload: { isActive: false, label: undefined },
  },
  editMetadataField: {
    idToUpdate: '2c43466a-fe9e-4005-8d08-c5836067aa6c',
    updatePayload: {
      defaultValue: undefined,
      description: null,
      icon: undefined,
      label: 'New label',
      name: 'newLabel',
      options: undefined,
    },
  },
};

const defaultResponseData = {
  id: '2c43466a-fe9e-4005-8d08-c5836067aa6c',
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
};

export const responseData = {
  default: defaultResponseData,
  createMetadataField: {
    ...defaultResponseData,
    defaultValue: '',
    options: [],
  },
};
