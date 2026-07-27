import { gql } from '@apollo/client';

export const GITHUB_CLAIM_AUTHORIZATION_URL = gql`
  query GithubClaimAuthorizationUrl($applicationRegistrationId: String!) {
    githubClaimAuthorizationUrl(
      applicationRegistrationId: $applicationRegistrationId
    )
  }
`;
