import gql from 'graphql-tag';

export const FIND_VERIFIED_EMAILING_DOMAINS = gql`
  query FindVerifiedEmailingDomains {
    getEmailingDomains {
      id
      domain
      status
    }
  }
`;
