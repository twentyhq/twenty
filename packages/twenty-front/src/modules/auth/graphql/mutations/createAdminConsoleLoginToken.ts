import { gql } from '@apollo/client';

export const CREATE_ADMIN_CONSOLE_LOGIN_TOKEN = gql`
  mutation CreateAdminConsoleLoginToken {
    createAdminConsoleLoginToken {
      loginToken
      adminConsoleUrl
    }
  }
`;
