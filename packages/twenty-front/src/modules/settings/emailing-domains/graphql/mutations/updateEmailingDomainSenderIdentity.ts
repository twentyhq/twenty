import { gql } from '@apollo/client';

export const UPDATE_EMAILING_DOMAIN_SENDER_IDENTITY = gql`
  mutation UpdateEmailingDomainSenderIdentity(
    $input: UpdateEmailingDomainSenderIdentityInput!
  ) {
    updateEmailingDomainSenderIdentity(input: $input) {
      id
      senderDisplayName
    }
  }
`;
