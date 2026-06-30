import { gql } from '@apollo/client';

export const FIND_MANY_PUBLIC_DOMAINS = gql`
  query FindManyPublicDomains {
    findManyPublicDomains {
      id
      domain
      isValidated
      applicationId
      createdAt
    }
  }
`;
