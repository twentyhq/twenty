import { gql } from '@apollo/client';

export const UPDATE_EMAIL_GROUP_CHANNEL = gql`
  mutation UpdateEmailGroupChannel($input: UpdateEmailGroupChannelInput!) {
    updateEmailGroupChannel(input: $input) {
      id
      displayName
    }
  }
`;
