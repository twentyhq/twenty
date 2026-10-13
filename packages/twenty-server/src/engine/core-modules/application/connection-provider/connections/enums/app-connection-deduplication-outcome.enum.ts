import { registerEnumType } from '@nestjs/graphql';

export enum AppConnectionDeduplicationOutcome {
  IDENTIFIED = 'IDENTIFIED',
  MERGED = 'MERGED',
  REJECTED = 'REJECTED',
}

registerEnumType(AppConnectionDeduplicationOutcome, {
  name: 'AppConnectionDeduplicationOutcome',
  description:
    'IDENTIFIED: the connection now carries the external account id; continue. MERGED: the credentials moved to the returned connection, which already held the account, and the connection the app was called for is deleted. REJECTED: the connection is flagged as needing reconnect with its tokens cleared.',
});
