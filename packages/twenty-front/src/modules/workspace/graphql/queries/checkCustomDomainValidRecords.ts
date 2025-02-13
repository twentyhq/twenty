import { gql } from '@apollo/client';

export const CHECK_CUSTOM_DOMAIN_VALID_RECORDS = gql`
  query CheckCustomDomainValidRecords {
    checkCustomDomainValidRecords {
      customDomain
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
