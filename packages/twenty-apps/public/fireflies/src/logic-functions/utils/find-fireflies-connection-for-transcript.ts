import { type AppConnection } from 'twenty-sdk/logic-function';

import { isDefined } from 'src/utils/is-defined';

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
}): Promise<FindFirefliesConnectionForTranscriptResult> => {
  const probes = connections.map(async (connection) => ({
    connection,
    transcriptResult: await fetchFirefliesTranscript({
      accessToken: connection.accessToken,
      transcriptId,
    }),
  }));

  // Resolves only on success so the race can finish without waiting for stalled accounts.
  const successfulProbes = probes.map(
    (probe) =>
      new Promise<FindFirefliesConnectionForTranscriptResult>((resolve) => {
        probe.then(({ connection, transcriptResult }) => {
          if (transcriptResult.ok) {
            resolve({ success: true, connection });
          }
        });
      }),
  );

  const settledProbes = Promise.all(probes).then(
    (probeOutcomes): FindFirefliesConnectionForTranscriptResult => {
      const successfulProbe = probeOutcomes.find(
        ({ transcriptResult }) => transcriptResult.ok,
      );

      if (isDefined(successfulProbe)) {
        return { success: true, connection: successfulProbe.connection };
      }

      const probeErrors = probeOutcomes.flatMap(
        ({ connection, transcriptResult }) =>
          transcriptResult.ok
            ? []
            : [`${connection.name}: ${transcriptResult.errorMessage}`],
      );

      return {
        success: false,
        error:
          probeErrors.join(' | ') ||
          `No connected Fireflies account can access transcript ${transcriptId}.`,
      };
    },
  );

  return Promise.race([...successfulProbes, settledProbes]);
};
