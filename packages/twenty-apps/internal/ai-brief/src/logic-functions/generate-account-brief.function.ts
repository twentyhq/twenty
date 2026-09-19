import { CoreApiClient } from 'twenty-client-sdk/core';
import {
  defineLogicFunction,
  type RoutePayload,
} from 'twenty-sdk/define';
import { runAgent } from 'twenty-sdk/logic-function';

import {
  ACCOUNT_BRIEF_SYNTHESIZER_AGENT_UNIVERSAL_IDENTIFIER,
  GENERATE_ACCOUNT_BRIEF_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';
import { isBriefTargetType, type BriefTargetType } from 'src/constants/target-types';
import { fetchRecentTimelineActivities } from 'src/logic-functions/data/fetch-recent-timeline-activities.util';
import { updateBriefFields } from 'src/logic-functions/data/update-brief-fields.util';
import { buildAccountBriefPrompt } from 'src/logic-functions/domain/build-account-brief-prompt.util';
import { parseAccountBriefResponse } from 'src/logic-functions/domain/parse-account-brief-response.util';

type GenerateAccountBriefBody = {
  targetType?: string;
  recordId?: string;
  displayName?: string;
};

type GenerateAccountBriefResult =
  | { outcome: 'invalid-payload' }
  | { outcome: 'no-activity' }
  | { outcome: 'agent-failed'; error: string }
  | { outcome: 'generated'; sentiment: string };

export const generateAccountBriefHandler = async (
  payload: RoutePayload<GenerateAccountBriefBody>,
): Promise<GenerateAccountBriefResult> => {
  const body = payload.body ?? {};

  if (
    !isBriefTargetType(body.targetType) ||
    typeof body.recordId !== 'string' ||
    body.recordId === ''
  ) {
    return { outcome: 'invalid-payload' };
  }

  const targetType: BriefTargetType = body.targetType;
  const recordId = body.recordId;
  const displayName = body.displayName ?? recordId;
  const now = new Date();
  const client = new CoreApiClient();

  const activities = await fetchRecentTimelineActivities({
    client,
    recordId,
    now,
  });

  if (activities.length === 0) {
    return { outcome: 'no-activity' };
  }

  const prompt = buildAccountBriefPrompt(displayName, activities);

  const agentResult = await runAgent({
    agentUniversalIdentifier:
      ACCOUNT_BRIEF_SYNTHESIZER_AGENT_UNIVERSAL_IDENTIFIER,
    prompt,
  });

  if (!agentResult.success || agentResult.result === null) {
    return {
      outcome: 'agent-failed',
      error: agentResult.error ?? 'unknown agent error',
    };
  }

  // Text agents return { response: string } (agent-async-executor wraps
  // generateText output in an object).
  const rawResult = agentResult.result as { response?: unknown };
  const rawResponse =
    typeof rawResult.response === 'string'
      ? rawResult.response
      : String(rawResult.response);

  const { briefMarkdown, sentiment } = parseAccountBriefResponse(rawResponse);

  await updateBriefFields({
    client,
    targetType,
    recordId,
    values: {
      briefMarkdown,
      sentiment,
      generatedAt: now.toISOString(),
    },
  });

  return { outcome: 'generated', sentiment };
};

export default defineLogicFunction({
  universalIdentifier:
    GENERATE_ACCOUNT_BRIEF_LOGIC_FUNCTION_UNIVERSAL_IDENTIFIER,
  name: 'generate-account-brief',
  description:
    'Generates the AI Brief for one Company or Person: reads recent timeline activity, runs the synthesizer agent and writes the brief fields.',
  timeoutSeconds: 300,
  handler: generateAccountBriefHandler,
  httpRouteTriggerSettings: {
    path: '/generate-account-brief',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
