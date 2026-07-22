import { gql } from '@apollo/client';

export const UPDATE_MESSAGE_CHANNEL = gql`
  mutation UpdateMessageChannel($input: UpdateMessageChannelInput!) {
    updateMessageChannel(input: $input) {
      id
      displayName
      visibility
      contactAutoCreationPolicy
      excludeNonProfessionalEmails
      excludeGroupEmails
      messageFolderImportPolicy
    }
  }
`;
