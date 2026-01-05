import gql from 'graphql-tag';

export const SAVE_WHATSAPP_ACCOUNT = gql`
  mutation SaveWhatsappAccount(
    $accountOwnerId: UUID!
    $bearerToken: String!
    $businessAccountId: String!
    $appSecret: String!
    $webhookToken: String!
    $id: UUID
  ) {
    saveWhatsappAccount(
      accountOwnerId: $accountOwnerId
      appSecret: $appSecret
      webhookToken: $webhookToken
      businessAccountId: $businessAccountId
      bearerToken: $bearerToken
      id: $id
    ) {
      success
      connectedAccountId
    }
  }
`;
