import { CoreApiClient } from 'twenty-client-sdk/core';

import { updateSlackAssistantRequest } from 'src/logic-functions/data/update-slack-assistant-request';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

export const renewSlackAssistantRequestLease = async ({
  requestId,
  responseText,
  agentChatThreadId,
}: {
  requestId: string;
  responseText: string;
  agentChatThreadId?: string | null;
}): Promise<void> => {
  try {
    await updateSlackAssistantRequest(new CoreApiClient(), {
      id: requestId,
      responseText,
      agentChatThreadId: agentChatThreadId ?? undefined,
    });
  } catch (error) {
    console.warn(
      `[slack] could not renew the lease of request ${requestId} while its answer waits for delivery: ${toErrorMessage(error)}`,
    );
  }
};
