import { type AppConnection } from 'twenty-sdk/logic-function';

import { isDefined } from 'src/utils/is-defined';

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
  const probeResults = await Promise.all(
    connections.map(async (connection) => ({
      connection,
      result: await fetchFirefliesTranscript({
        accessToken: connection.accessToken,
        transcriptId,
      }),
    })),
  );

  const matchingProbe = probeResults.find(({ result }) => result.ok);

  if (isDefined(matchingProbe)) {
    return { success: true, connection: matchingProbe.connection };
  }

  const connectionErrors = probeResults.flatMap(({ connection, result }) =>
    result.ok ? [] : [`${connection.name}: ${result.errorMessage}`],
  );

  return {
    success: false,
    error:
      connectionErrors.join(' | ') ||
      `No connected Fireflies account can access transcript ${transcriptId}.`,
  };
};
