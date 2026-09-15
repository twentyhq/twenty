import gql from 'graphql-tag';

export const GENERATE_SIGNED_DPA = gql`
  mutation GenerateSignedDpa($input: GenerateSignedDpaInput!) {
    generateSignedDpa(input: $input) {
      downloadUrl
      agreement {
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
  }
`;
