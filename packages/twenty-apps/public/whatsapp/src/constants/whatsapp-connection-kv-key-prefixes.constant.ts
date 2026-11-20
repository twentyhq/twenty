// one key per account and per connection, so concurrent connects never overwrite each other
export const WHATSAPP_CONNECTION_KV_KEY_PREFIXES = {
  connectedAccountIdByBusinessAccountId: 'whatsapp-business-account-connection:',
  businessAccountIdsByConnectedAccountId: 'whatsapp-connection-business-accounts:',
} as const;
