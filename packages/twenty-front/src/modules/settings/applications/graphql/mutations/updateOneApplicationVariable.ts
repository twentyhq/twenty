import { gql } from '@apollo/client';

export const UPDATE_ONE_APPLICATION_VARIABLE = gql`
  mutation UpdateOneApplicationVariable(
    $key: String!
    $value: String!
    $applicationId: UUID!
  ) {
    updateOneApplicationVariable(
      key: $key
      value: $value
      applicationId: $applicationId
    )
  }
`;
