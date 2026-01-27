import { gql } from '@apollo/client';

export const GET_FRONT_COMPONENT_CODE = gql`
  query GetFrontComponentCode($id: UUID!) {
    getFrontComponentCode(id: $id) {
      sourceCode
    }
  }
`;
