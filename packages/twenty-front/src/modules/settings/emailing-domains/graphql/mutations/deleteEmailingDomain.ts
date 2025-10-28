import { gql } from '@apollo/client';

export const DELETE_EMAILING_DOMAIN = gql`
  mutation DeleteEmailingDomain($id: String!) {
    deleteEmailingDomain(id: $id)
  }
`;
