import { gql } from '@apollo/client';

export const APPLICATION_FRAGMENT = gql`
  fragment ApplicationFields on Application {
    id
    name
    description
  }
`;
