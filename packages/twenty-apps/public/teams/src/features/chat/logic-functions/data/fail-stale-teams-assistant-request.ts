import { isNonEmptyArray } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { TEAMS_ASSISTANT_REQUEST_STATUS } from 'src/features/chat/logic-functions/constants/teams-assistant-request-status';
import { TEAMS_ASSISTANT_REQUEST_TIMEOUT_SECONDS } from 'src/features/chat/logic-functions/constants/teams-assistant-request-timeout-seconds';

export const failStaleTeamsAssistantRequest = async ({
  client,
  id,
  errorMessage,
}: {
  client: Pick<CoreApiClient, 'mutation'>;
  id: string;
  errorMessage: string;
}): Promise<boolean> => {
  const leaseCutoff = new Date(
    Date.now() - TEAMS_ASSISTANT_REQUEST_TIMEOUT_SECONDS * 1000,
  ).toISOString();

  const mutationResult = await client.mutation({
    updateTeamsAssistantRequests: {
      __args: {
        data: { status: TEAMS_ASSISTANT_REQUEST_STATUS.FAILED, errorMessage },
        filter: {
          and: [
            { id: { eq: id } },
            {
              status: {
                in: [
                  TEAMS_ASSISTANT_REQUEST_STATUS.PENDING,
                  TEAMS_ASSISTANT_REQUEST_STATUS.PROCESSING,
                ],
              },
            },
            { updatedAt: { lt: leaseCutoff } },
          ],
        },
      },
      id: true,
    },
  });

  return isNonEmptyArray(mutationResult.updateTeamsAssistantRequests);
};
