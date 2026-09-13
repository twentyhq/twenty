import { CoreApiClient } from 'twenty-client-sdk/core';

import { SLACK_ASSISTANT_REQUEST_STATUS } from 'src/logic-functions/constants/slack-assistant-request-status';
import { updateSlackAssistantRequest } from 'src/logic-functions/data/update-slack-assistant-request';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

// a failed status write must not fail the job: a retry would post the answer twice
export const markSlackAssistantRequestDone = async ({
  requestId,
  responseText,
}: {
  requestId: string;
  responseText: string;
}): Promise<boolean> => {
  try {
    await updateSlackAssistantRequest(new CoreApiClient(), {
      id: requestId,
      status: SLACK_ASSISTANT_REQUEST_STATUS.DONE,
      responseText,
    });

    return true;
  } catch (error) {
    console.warn(
      `[slack] delivered request ${requestId} but could not mark it done: ${toErrorMessage(error)}`,
    );

    return false;
  }
};
