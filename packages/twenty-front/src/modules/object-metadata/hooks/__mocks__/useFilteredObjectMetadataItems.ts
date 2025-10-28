import { gql } from '@apollo/client';

export const query = gql`
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
      isCustom
      isActive
      createdAt
      updatedAt
      labelIdentifierFieldMetadataId
      imageIdentifierFieldMetadataId
    }
  }
`;

export const variables = {
  idToUpdate: 'idToUpdate',
  updatePayload: {
    description: 'newDescription',
    icon: undefined,
    labelIdentifierFieldMetadataId: null,
    labelPlural: 'labelPlural',
    labelSingular: 'labelSingular',
    namePlural: 'labelPlural',
    nameSingular: 'labelSingular',
  },
};

export const responseData = {
  id: 'idToUpdate',
  nameSingular: 'nameSingular',
  namePlural: 'namePlural',
  labelSingular: 'labelSingular',
  labelPlural: 'labelPlural',
  description: 'newDescription',
  icon: '',
  isCustom: false,
  isActive: true,
  createdAt: '',
  updatedAt: '',
  labelIdentifierFieldMetadataId: '20202020-72ba-4e11-a36d-e17b544541e1',
  imageIdentifierFieldMetadataId: '',
};
