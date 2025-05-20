import { gql } from '@apollo/client';

export const UPDATE_ISSUER_MUTATION = gql`
  mutation UpdateIssuer($id: ID!, $updateInput: UpdateIssuerInput!) {
    updateIssuer(id: $id, updateInput: $updateInput) {
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
      # Add other fields from IssuerDto if needed
    }
  }
`;
