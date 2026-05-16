import { isNonEmptyString } from '@sniptt/guards';
import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';

import { FIREFLIES_LIST_CALLS_BY_PARTICIPANT_ROUTE_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { firefliesListCallsByParticipantHandler } from 'src/logic-functions/handlers/fireflies-list-calls-by-participant-handler';

const parsePositiveInteger = (value: unknown): number | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

const handler = async (event: RoutePayload) => {
  const params = event.queryStringParameters ?? {};
  const rawEmail = params.participantEmail;

  if (typeof rawEmail !== 'string') {
    return {
      success: false,
      message: 'Failed to list Fireflies calls',
      error: '`participantEmail` query parameter is required.',
    };
  }

  const participantEmail = rawEmail.trim();

  if (!isNonEmptyString(participantEmail)) {
    return {
      success: false,
      message: 'Failed to list Fireflies calls',
      error: '`participantEmail` query parameter is required.',
    };
  }

  return firefliesListCallsByParticipantHandler({
    participantEmail,
    limit: parsePositiveInteger(params.limit),
  });
};

export default defineLogicFunction({
  universalIdentifier:
    FIREFLIES_LIST_CALLS_BY_PARTICIPANT_ROUTE_UNIVERSAL_IDENTIFIER,
  name: 'fireflies-list-calls-by-participant-route',
  timeoutSeconds: 30,
  handler,
  httpRouteTriggerSettings: {
    path: '/fireflies/calls/by-participant',
    httpMethod: 'GET',
    isAuthRequired: true,
  },
});
