import { gql } from '@apollo/client';

import { OBJECT_METADATA_FRAGMENT } from '@/object-metadata/graphql/fragment';

// Selects the full ObjectMetadataFields shape (same as the bootstrap query) so
// the created object written to the metadata store is complete. addToDraft
// replaces store entries by id, so a reduced response here would overwrite the
// fuller record delivered over SSE and leave object-level flags such as
// isUICreatable/isUIEditable undefined — making the new object read-only (no
// "create record" affordance in its table view) until a hard refresh.
export const CREATE_ONE_OBJECT_METADATA_ITEM = gql`
  mutation CreateOneObjectMetadataItem($input: CreateOneObjectInput!) {
    createOneObject(input: $input) {
      ...ObjectMetadataFields
    }
  }
  ${OBJECT_METADATA_FRAGMENT}
`;

export const CREATE_ONE_FIELD_METADATA_ITEM = gql`
  mutation CreateOneFieldMetadataItem($input: CreateOneFieldMetadataInput!) {
    createOneField(input: $input) {
      id
      type
      name
      label
      description
      icon
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
      relation {
        type
        sourceObjectMetadata {
          id
          nameSingular
          namePlural
        }
        targetObjectMetadata {
          id
          nameSingular
          namePlural
        }
        sourceFieldMetadata {
          id
          name
        }
        targetFieldMetadata {
          id
          name
        }
      }
      morphRelations {
        type
        sourceObjectMetadata {
          id
          nameSingular
          namePlural
        }
        targetObjectMetadata {
          id
          nameSingular
          namePlural
        }
        sourceFieldMetadata {
          id
          name
        }
        targetFieldMetadata {
          id
          name
        }
      }
    }
  }
`;

export const UPDATE_ONE_FIELD_METADATA_ITEM = gql`
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
      isActive
      isUnique
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
`;

export const UPDATE_ONE_OBJECT_METADATA_ITEM = gql`
  mutation UpdateOneObjectMetadataItem(
    $idToUpdate: UUID!
    $updatePayload: UpdateObjectPayload!
  ) {
    updateOneObject(input: { id: $idToUpdate, update: $updatePayload }) {
      id
      nameSingular
      namePlural
      labelSingular
      labelPlural
      description
      icon
      color
      isActive
      isSearchable
      createdAt
      updatedAt
      labelIdentifierFieldMetadataId
      imageIdentifierFieldMetadataId
      isLabelSyncedWithName
      applicationId
    }
  }
`;

export const DELETE_ONE_OBJECT_METADATA_ITEM = gql`
  mutation DeleteOneObjectMetadataItem($idToDelete: UUID!) {
    deleteOneObject(input: { id: $idToDelete }) {
      id
      nameSingular
      namePlural
      labelSingular
      labelPlural
      description
      icon
      color
      isActive
      isSearchable
      createdAt
      updatedAt
      labelIdentifierFieldMetadataId
      imageIdentifierFieldMetadataId
      isLabelSyncedWithName
      applicationId
    }
  }
`;

export const DELETE_ONE_FIELD_METADATA_ITEM = gql`
  mutation DeleteOneFieldMetadataItem($idToDelete: UUID!) {
    deleteOneField(input: { id: $idToDelete }) {
      id
      type
      name
      label
      description
      icon
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
`;

export const CREATE_ONE_INDEX_METADATA_ITEM = gql`
  mutation CreateOneIndexMetadataItem($input: CreateOneIndexInput!) {
    createOneIndex(input: $input) {
      id
      name
      indexType
      isUnique
      isCustom
      indexWhereClause
      createdAt
      updatedAt
      indexFieldMetadataList {
        id
        fieldMetadataId
        subFieldName
        createdAt
        updatedAt
        order
      }
    }
  }
`;

export const DELETE_ONE_INDEX_METADATA_ITEM = gql`
  mutation DeleteOneIndexMetadataItem($idToDelete: UUID!) {
    deleteOneIndex(input: { id: $idToDelete }) {
      id
      name
    }
  }
`;
