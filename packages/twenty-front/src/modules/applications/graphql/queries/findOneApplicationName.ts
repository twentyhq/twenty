import { gql } from '@apollo/client';

// Lean alternative to FindOneApplication for callers that only render the
// application name, avoiding the nested agents/objects/logicFunctions payload.
export const FIND_ONE_APPLICATION_NAME = gql`
  query FindOneApplicationName($id: UUID!) {
    findOneApplication(id: $id) {
      id
      name
    }
  }
`;
