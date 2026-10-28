import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { type InboxMessageSender } from 'twenty-shared/application';

import { resolveInboxAccessTokenOrThrow } from '@/sdk/inbox/resolve-inbox-access-token-or-throw';

export const createInboxMetadataClient = ({
  sender,
}: {
  sender: InboxMessageSender;
}): MetadataApiClient =>
  new MetadataApiClient({
    headers: {
      Authorization: `Bearer ${resolveInboxAccessTokenOrThrow(sender)}`,
    },
  });
