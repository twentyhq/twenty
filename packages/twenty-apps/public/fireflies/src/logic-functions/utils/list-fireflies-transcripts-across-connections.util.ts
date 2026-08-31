import { type AppConnection } from 'twenty-sdk/logic-function';

import { type FirefliesCallSummary } from 'src/logic-functions/types/fireflies-call-list-result.type';
import { listFirefliesTranscripts } from 'src/logic-functions/utils/list-fireflies-transcripts.util';

type ListFirefliesTranscriptsAcrossConnectionsParams = {
  connections: AppConnection[];
  limit: number;
  keyword?: string;
  keywordScope?: 'title' | 'sentences' | 'all';
  participants?: string[];
};

type ListFirefliesTranscriptsAcrossConnectionsResult = {
  calls: FirefliesCallSummary[];
  connectionErrors: string[];
  successfulConnectionCount: number;
};

const getCallTimestamp = (call: FirefliesCallSummary): number => {
  if (call.date === null) {
    return Number.NEGATIVE_INFINITY;
  }

  const timestamp = Date.parse(call.date);

  return Number.isFinite(timestamp) ? timestamp : Number.NEGATIVE_INFINITY;
};

export const listFirefliesTranscriptsAcrossConnections = async ({
  connections,
  limit,
  keyword,
  keywordScope,
  participants,
}: ListFirefliesTranscriptsAcrossConnectionsParams): Promise<ListFirefliesTranscriptsAcrossConnectionsResult> => {
  const connectionResults = await Promise.all(
    connections.map(async (connection) => ({
      connection,
      result: await listFirefliesTranscripts({
        accessToken: connection.accessToken,
        keyword,
        keywordScope,
        participants,
        limit,
      }),
    })),
  );

  const connectionErrors = connectionResults.flatMap(
    ({ connection, result }) =>
      result.ok ? [] : [`${connection.name}: ${result.errorMessage}`],
  );
  const successfulConnectionCount = connectionResults.filter(
    ({ result }) => result.ok,
  ).length;

  const callsById = new Map<string, FirefliesCallSummary>();

  for (const { result } of connectionResults) {
    if (!result.ok) {
      continue;
    }

    for (const call of result.data) {
      if (!callsById.has(call.id)) {
        callsById.set(call.id, call);
      }
    }
  }

  const calls = [...callsById.values()]
    .sort((leftCall, rightCall) => {
      return getCallTimestamp(rightCall) - getCallTimestamp(leftCall);
    })
    .slice(0, limit);

  return { calls, connectionErrors, successfulConnectionCount };
};
