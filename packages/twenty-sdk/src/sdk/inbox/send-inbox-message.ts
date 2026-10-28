import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { type SendInboxMessageResult } from 'twenty-shared/application';

import { type SendInboxMessageInput } from '@/sdk/define/common/types/loose-shared-types.type';
import { getApplicationAccessToken } from '@/sdk/utils/get-application-access-token';

export const sendInboxMessage = async (
  input: SendInboxMessageInput,
): Promise<SendInboxMessageResult> => {
  const client = new MetadataApiClient({
    headers: { Authorization: `Bearer ${getApplicationAccessToken()}` },
  });

  const { sendInboxMessage: result } = await client.mutation({
    sendInboxMessage: {
      __args: { input },
      threadId: true,
    },
  });

  return result;
};
