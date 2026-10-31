import {
  type AiRunEvent,
  type AiRunEventsInput,
} from 'twenty-shared/application';

import { AI_RUN_EVENT_FIELDS } from '@/sdk/logic-function/ai/ai-run-event-fields.constant';
import { postGraphqlRequest } from '@/sdk/logic-function/utils/post-graphql-request.util';

const AI_RUN_EVENTS_QUERY = `
  query AiRunEvents($runId: UUID, $agentUniversalIdentifier: UUID, $threadKey: String, $after: String) {
    aiRunEvents(runId: $runId, agentUniversalIdentifier: $agentUniversalIdentifier, threadKey: $threadKey, after: $after) {
      ${AI_RUN_EVENT_FIELDS}
    }
  }
`;

export const listRunEvents = async (
  input: AiRunEventsInput,
): Promise<AiRunEvent[]> => {
  const { aiRunEvents } = await postGraphqlRequest<
    AiRunEventsInput,
    { aiRunEvents: AiRunEvent[] }
  >({
    query: AI_RUN_EVENTS_QUERY,
    variables: input,
    caller: 'listRunEvents',
  });

  return aiRunEvents;
};
