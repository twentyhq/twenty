import gql from 'graphql-tag';

export const GET_DPA_AGREEMENTS = gql`
  query GetDpaAgreements {
    dpaAgreements {
      id
      type
      templateVersion
      region
      processorEntity
      customerLegalEntityName
      signatoryName
      signatoryTitle
      acceptedByEmail
      acceptedAt
      createdAt
    }
  }
`;
