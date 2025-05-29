import { gql } from '@apollo/client';

export const CREATE_ISSUER_MUTATION = gql`
  mutation CreateIssuer($createInput: CreateIssuerInput!) {
    createIssuer(createInput: $createInput) {
      id
      name
      cnpj
      # Include other fields if needed for immediate feedback or cache update
    }
  }
`;
