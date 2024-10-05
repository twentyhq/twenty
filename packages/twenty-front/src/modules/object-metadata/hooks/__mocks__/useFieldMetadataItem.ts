import { gql } from '@apollo/client';
import { FieldMetadataType } from '~/generated/graphql';

export const FIELD_METADATA_ID = '2c43466a-fe9e-4005-8d08-c5836067aa6c';
export const FIELD_RELATION_METADATA_ID = '4da0302d-358a-45cd-9973-9f92723ed3c1';
export const RELATION_METADATA_ID = 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6';

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
  settings
`;

export const queries = {
  deleteMetadataField: gql`
    mutation DeleteOneFieldMetadataItem($idToDelete: UUID!) {
      deleteOneField(input: { id: $idToDelete }) {
        ${baseFields}
      }
    }
  `,
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
        ${baseFields}
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
};

export const objectMetadataId = '25611fce-6637-4089-b0ca-91afeec95784';

export const variables = {
  deleteMetadataField: { idToDelete: FIELD_METADATA_ID },
  deleteMetadataFieldRelation: { idToDelete: RELATION_METADATA_ID },
  activateMetadataField: {
    idToUpdate: FIELD_METADATA_ID,
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
        settings: undefined,
        objectMetadataId,
        type: 'TEXT',
      },
    },
  },
  deactivateMetadataField: {
    idToUpdate: FIELD_METADATA_ID,
    updatePayload: { isActive: false, label: undefined },
  }
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
};

