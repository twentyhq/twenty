import { type AppConnection } from 'twenty-sdk/logic-function';

import { fetchFirefliesTranscript } from 'src/logic-functions/utils/fetch-fireflies-transcript';

type FindFirefliesConnectionForTranscriptResult =
  | { success: true; connection: AppConnection }
  | { success: false; error: string };

export const findFirefliesConnectionForTranscript = ({
  connections,
  transcriptId,
}: {
  connections: AppConnection[];
  transcriptId: string;
}): Promise<FindFirefliesConnectionForTranscriptResult> =>
  new Promise((resolve) => {
    if (connections.length === 0) {
      resolve({
        success: false,
        error: `No connected Fireflies account can access transcript ${transcriptId}.`,
      });

      return;
    }

    const probeErrors: string[] = [];
    let settledProbeCount = 0;

    const recordProbeFailure = (
      connectionIndex: number,
      errorMessage: string,
    ) => {
      probeErrors[connectionIndex] = errorMessage;
      settledProbeCount += 1;

      if (settledProbeCount === connections.length) {
        resolve({ success: false, error: probeErrors.join(' | ') });
      }
    };

    connections.forEach((connection, connectionIndex) => {
      fetchFirefliesTranscript({
        accessToken: connection.accessToken,
        transcriptId,
      }).then(
        (transcriptResult) => {
          if (transcriptResult.ok) {
            resolve({ success: true, connection });

            return;
          }

          recordProbeFailure(
            connectionIndex,
            `${connection.name}: ${transcriptResult.errorMessage}`,
          );
        },
        (probeError: unknown) =>
          recordProbeFailure(
            connectionIndex,
            `${connection.name}: ${(probeError as Error).message}`,
          ),
      );
    });
  });
