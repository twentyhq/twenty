import { GraphRequestError } from 'src/features/transcripts/logic-functions/types/graph-request-error';
import { fetchGraphResponse } from 'src/features/transcripts/logic-functions/utils/fetch-graph-response';

export const deleteTeamsTranscriptSubscription = async ({
  accessToken,
  subscriptionId,
}: {
  accessToken: string;
  subscriptionId: string;
}): Promise<void> => {
  try {
    await fetchGraphResponse({
      accessToken,
      url: `subscriptions/${encodeURIComponent(subscriptionId)}`,
      accept: 'application/json',
      method: 'DELETE',
    });
  } catch (error) {
    if (error instanceof GraphRequestError && error.status === 404) {
      return;
    }

    throw error;
  }
};
