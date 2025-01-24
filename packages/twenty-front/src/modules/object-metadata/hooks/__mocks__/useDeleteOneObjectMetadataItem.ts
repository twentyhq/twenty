import { gql } from '@apollo/client';

export const query = gql`
  mutation DeleteOneObjectMetadataItem($idToDelete: UUID!) {
    deleteOneObject(input: { id: $idToDelete }) {
      id
      dataSourceId
      nameSingular
      namePlural
      labelSingular
      labelPlural
      description
      icon
      isCustom
      isActive
      createdAt
      updatedAt
      labelIdentifierFieldMetadataId
      imageIdentifierFieldMetadataId
    }
  }
`;

export const variables = { idToDelete: 'idToDelete' };

export const responseData = {
  id: '',
  dataSourceId: '',
  nameSingular: '',
  namePlural: '',
  labelSingular: '',
  labelPlural: '',
  description: '',
  icon: '',
  isCustom: false,
  isActive: true,
  createdAt: '',
  updatedAt: '',
  labelIdentifierFieldMetadataId: '20202020-72ba-4e11-a36d-e17b544541e1',
  imageIdentifierFieldMetadataId: '',
};
