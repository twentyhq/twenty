import { isNonEmptyString } from '@sniptt/guards';
import { listConnections } from 'twenty-sdk/logic-function';

import { type FirefliesCallListResult } from 'src/logic-functions/types/fireflies-call-list-result.type';
import { type FirefliesListCallsByParticipantInput } from 'src/logic-functions/types/fireflies-list-calls-by-participant-input.type';
import { listFirefliesTranscriptsAcrossConnections } from 'src/logic-functions/utils/list-fireflies-transcripts-across-connections.util';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

const clampLimit = (limit: number | undefined): number => {
  if (!Number.isFinite(limit) || limit === undefined) {
    return DEFAULT_LIMIT;
  }

  return Math.max(1, Math.min(MAX_LIMIT, Math.trunc(limit)));
};

export const firefliesListCallsByParticipantHandler = async (
  parameters: FirefliesListCallsByParticipantInput,
): Promise<FirefliesCallListResult> => {
  const participantEmail = parameters.participantEmail?.trim();

  if (!isNonEmptyString(participantEmail)) {
    return {
      success: false,
      message: 'Failed to list Fireflies calls',
      error: '`participantEmail` is required.',
    };
  }

  const connections = await listConnections({
    providerName: 'fireflies',
    visibility: 'workspace',
  });

  if (connections.length === 0) {
    return {
      success: false,
      message: 'Fireflies is not configured',
      error: 'Add at least one workspace-shared Fireflies connection.',
    };
  }

  const result = await listFirefliesTranscriptsAcrossConnections({
    connections,
    participants: [participantEmail],
    limit: clampLimit(parameters.limit),
  });

  if (result.successfulConnectionCount === 0) {
    return {
      success: false,
      message: 'Failed to list Fireflies calls',
      error: result.connectionErrors.join(' | '),
    };
  }

  return {
    success: true,
    message: `Found ${result.calls.length} Fireflies call(s) with ${participantEmail} across ${result.successfulConnectionCount} connected account(s).`,
    calls: result.calls,
    count: result.calls.length,
    ...(result.connectionErrors.length > 0
      ? { error: result.connectionErrors.join(' | ') }
      : {}),
  };
};
