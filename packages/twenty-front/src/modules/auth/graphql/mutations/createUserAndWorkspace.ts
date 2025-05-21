import { gql } from '@apollo/client';

export const CREATE_USER_AND_WORKSPACE = gql`
  mutation CreateUserAndWorkspace(
    $email: String!
    $firstName: String
    $lastName: String
    $picture: String
    $captchaToken: String
    $locale: String
  ) {
    createUserAndWorkspace(
      email: $email
      firstName: $firstName
      lastName: $lastName
      picture: $picture
      captchaToken: $captchaToken
      locale: $locale
    ) {
      loginToken {
        ...AuthTokenFragment
      }
      workspace {
        id
        workspaceUrls {
          subdomainUrl
          customUrl
        }
      }
    }
  }
`;
