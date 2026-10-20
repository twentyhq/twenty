import { gql } from '@apollo/client';

export const UPDATE_MY_USER_APPLICATION_VARIABLE = gql`
  mutation UpdateMyUserApplicationVariable(
    $applicationUniversalIdentifier: String!
    $key: String!
    $value: String!
  ) {
    updateMyUserApplicationVariable(
      applicationUniversalIdentifier: $applicationUniversalIdentifier
      key: $key
      value: $value
    )
  }
`;
