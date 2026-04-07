import gql from 'graphql-tag';

export const SEND_EMAIL = gql`
  mutation SendEmail($input: SendEmailInput!) {
    sendEmail(input: $input) {
      success
      error
    }
  }
`;
