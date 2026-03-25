import { gql } from '@apollo/client';

export const CHECK_PUBLIC_DOMAIN_VALID_RECORDS = gql`
  mutation CheckPublicDomainValidRecords($domain: String!) {
    checkPublicDomainValidRecords(domain: $domain) {
      id
      domain
      records {
        type
        key
        value
        validationType
        status
      }
    }
  }
`;
