import { isNonEmptyString } from '@sniptt/guards';
import { type RunAgentMessage } from 'twenty-shared/application';

import { type AgentTriggerPayload } from 'src/engine/metadata-modules/ai/ai-agent-trigger/types/agent-trigger-payload.type';

const describeTriggerPayload = (payload: AgentTriggerPayload): string => {
  switch (payload.type) {
    case 'CRON':
      return `You were started by your schedule at ${payload.firedAt}.`;
    case 'DATABASE_EVENT':
      return [
        `You were started by the "${payload.eventName}" event on ${payload.events.length} ${payload.objectNameSingular} record(s):`,
        '```json',
        JSON.stringify(payload.events, null, 2),
        '```',
      ].join('\n');
  }
};

export const buildAgentTriggerMessages = ({
  instructions,
  payload,
}: {
  instructions: string | null;
  payload: AgentTriggerPayload;
}): RunAgentMessage[] => [
  {
    role: 'user',
    content: [
      describeTriggerPayload(payload),
      isNonEmptyString(instructions)
        ? instructions
        : 'Act on this according to your instructions.',
    ].join('\n\n'),
  },
];
