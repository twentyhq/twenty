import { gql } from '@apollo/client';

export const CHECK_CUSTOM_DOMAIN_VALID_RECORDS = gql`
  mutation CheckCustomDomainValidRecords {
    checkCustomDomainValidRecords {
      id
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
