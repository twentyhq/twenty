import { gql } from '@apollo/client';

export const query = gql`
  mutation CreateOneRelationMetadataItem(
    $input: CreateOneRelationMetadataInput!
  ) {
    createOneRelationMetadata(input: $input) {
      id
      relationType
      fromObjectMetadataId
      toObjectMetadataId
      fromFieldMetadataId
      toFieldMetadataId
      createdAt
      updatedAt
    }
  }
`;

export const variables = {
  input: {
    relationMetadata: {
      fromDescription: null,
      fromIcon: undefined,
      fromLabel: 'label',
      fromName: 'name',
      fromObjectMetadataId: 'objectMetadataId',
      relationType: 'ONE_TO_ONE',
      toDescription: null,
      toIcon: undefined,
      toLabel: 'Another label',
      toName: 'anotherName',
      toObjectMetadataId: 'objectMetadataId1',
    },
  },
};

export const responseData = {
  id: '',
  relationType: 'ONE_TO_ONE',
  fromObjectMetadataId: 'objectMetadataId',
  toObjectMetadataId: 'objectMetadataId1',
  fromFieldMetadataId: '',
  toFieldMetadataId: '',
  createdAt: '',
  updatedAt: '',
};
