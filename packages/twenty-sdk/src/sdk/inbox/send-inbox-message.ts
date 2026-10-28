import { type SendInboxMessageResult } from 'twenty-shared/application';

import { type SendInboxMessageInput } from '@/sdk/define/common/types/loose-shared-types.type';
import { createInboxMetadataClient } from '@/sdk/inbox/create-inbox-metadata-client';

export const sendInboxMessage = async (
  input: SendInboxMessageInput,
): Promise<SendInboxMessageResult> => {
  const client = createInboxMetadataClient({ sender: 'APPLICATION' });

  const { sendInboxMessage: result } = await client.mutation({
    sendInboxMessage: {
      __args: { input },
      threadId: true,
    },
  });

  return result;
};
