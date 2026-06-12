import { isNonEmptyString } from '@sniptt/guards';

import { type FirefliesCallListResult } from 'src/logic-functions/types/fireflies-call-list-result.type';
import { type FirefliesListCallsByParticipantInput } from 'src/logic-functions/types/fireflies-list-calls-by-participant-input.type';
import { getFirefliesApiKey } from 'src/logic-functions/utils/get-fireflies-api-key';
import { listFirefliesTranscripts } from 'src/logic-functions/utils/list-fireflies-transcripts';

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

  const apiKeyResult = getFirefliesApiKey();

  if (!apiKeyResult.success) {
    return {
      success: false,
      message: 'Fireflies is not configured',
      error: apiKeyResult.error,
    };
  }

  const result = await listFirefliesTranscripts({
    apiKey: apiKeyResult.apiKey,
    participants: [participantEmail],
    limit: clampLimit(parameters.limit),
  });

  if (!result.ok) {
    return {
      success: false,
      message: 'Failed to list Fireflies calls',
      error: result.errorMessage,
    };
  }

  return {
    success: true,
    message: `Found ${result.data.length} Fireflies call(s) with ${participantEmail}.`,
    calls: result.data,
    count: result.data.length,
  };
};
