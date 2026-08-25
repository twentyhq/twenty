import { type AppConnection } from 'twenty-sdk/logic-function';

import { fetchFirefliesTranscript } from 'src/logic-functions/utils/fetch-fireflies-transcript';

export const findFirefliesConnectionForTranscript = async ({
  connections,
  transcriptId,
}: {
  connections: AppConnection[];
  transcriptId: string;
}): Promise<
  | { success: true; connection: AppConnection }
  | { success: false; error: string }
> => {
  const connectionErrors: string[] = [];

  for (const connection of connections) {
    const transcriptResult = await fetchFirefliesTranscript({
      accessToken: connection.accessToken,
      transcriptId,
    });

    if (transcriptResult.ok) {
      return { success: true, connection };
    }

    connectionErrors.push(
      `${connection.name}: ${transcriptResult.errorMessage}`,
    );
  }

  return {
    success: false,
    error:
      connectionErrors.join(' | ') ||
      `No connected Fireflies account can access transcript ${transcriptId}.`,
  };
};
