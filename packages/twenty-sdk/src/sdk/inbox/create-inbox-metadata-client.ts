import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { type InboxMessageSender } from 'twenty-shared/application';

import { resolveInboxAccessToken } from '@/sdk/inbox/resolve-inbox-access-token';

export const createInboxMetadataClient = ({
  sender,
}: {
  sender: InboxMessageSender;
}): MetadataApiClient =>
  new MetadataApiClient({
    headers: { Authorization: `Bearer ${resolveInboxAccessToken(sender)}` },
  });
