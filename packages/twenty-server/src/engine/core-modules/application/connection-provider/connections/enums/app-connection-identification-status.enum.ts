import { registerEnumType } from '@nestjs/graphql';

export enum AppConnectionIdentificationStatus {
  IDENTIFIED = 'IDENTIFIED',
  MERGED_INTO_EXISTING = 'MERGED_INTO_EXISTING',
  ALREADY_CONNECTED = 'ALREADY_CONNECTED',
  ACCOUNT_CHANGED = 'ACCOUNT_CHANGED',
}

registerEnumType(AppConnectionIdentificationStatus, {
  name: 'AppConnectionIdentificationStatus',
  description:
    'IDENTIFIED: the connection now carries the external account id; continue. MERGED_INTO_EXISTING: the credentials moved to the returned connection, which already held the account, and the connection the app was called for is deleted. ALREADY_CONNECTED: another connection already holds the account; the connection is flagged as needing reconnect with its tokens cleared. ACCOUNT_CHANGED: a reconnect signed in with a different account; the connection is flagged as needing reconnect with its tokens cleared.',
});
