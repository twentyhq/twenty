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
  try {
    const connection = await Promise.any(
      connections.map(async (connection) => {
        const transcriptResult = await fetchFirefliesTranscript({
          accessToken: connection.accessToken,
          transcriptId,
        });

        if (!transcriptResult.ok) {
          throw new Error(
            `${connection.name}: ${transcriptResult.errorMessage}`,
          );
        }

        return connection;
      }),
    );

    return { success: true, connection };
  } catch (error) {
    const probeErrors =
      error instanceof AggregateError
        ? error.errors.map((probeError) => (probeError as Error).message)
        : [(error as Error).message];

    return {
      success: false,
      error:
        probeErrors.join(' | ') ||
        `No connected Fireflies account can access transcript ${transcriptId}.`,
    };
  }
};
