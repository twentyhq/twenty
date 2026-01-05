import gql from 'graphql-tag';

export const GET_CONNECTED_WHATSAPP_ACCOUNT = gql`
  query GetConnectedWhatsappAccount(
    $connectedAccountId: UUID!
    $businessAccountId: String!
  ) {
    getConnectedWhatsappAccount(
      connectedAccountId: $connectedAccountId
      businessAccountId: $businessAccountId
    ) {
      appSecret
      bearerToken
      id
      businessAccountId
      provider
      accountOwnerId
      webhookToken
    }
  }
`;
