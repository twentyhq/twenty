import { gql } from '@apollo/client';

export const FIND_ONE_APPLICATION_NAME = gql`
  query FindOneApplicationName($id: UUID!) {
    findOneApplication(id: $id) {
      id
      name
    }
  }
`;
