import { gql } from '@apollo/client';

export const GET_ALL_ISSUERS_BY_WORKSPACE = gql`
  query GetIssuersByWorkspace {
    getIssuersByWorkspace {
      id
      name
      cnpj
      cpf
      ie
      cnaeCode
      cep
      street
      number
      neighborhood
      city
      state
      taxRegime
      createdAt
      updatedAt
      # workspace { # Not strictly needed for the list display, can add if detail view needs it
      #   id
      # }
    }
  }
`;
