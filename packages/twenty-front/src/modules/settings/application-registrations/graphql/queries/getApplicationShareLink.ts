import { gql } from '@apollo/client';

export const GET_APPLICATION_SHARE_LINK = gql`
  query GetApplicationShareLink($id: String!) {
    getApplicationShareLink(id: $id)
  }
`;
