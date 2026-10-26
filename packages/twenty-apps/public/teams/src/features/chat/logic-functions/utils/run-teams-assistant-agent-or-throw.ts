import { isNonEmptyString } from '@sniptt/guards';
import { type RunAgentInput, runAgent } from 'twenty-sdk/logic-function';

import { TEAMS_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER } from 'src/features/chat/constants/universal-identifiers';
import { type TeamsAssistantTurn } from 'src/features/chat/logic-functions/types/teams-assistant-turn.type';

type TeamsAssistantAgentMessage = NonNullable<
  RunAgentInput['messages']
>[number];

const hasResponseText = (result: object): result is { response: string } =>
  'response' in result && typeof result.response === 'string';

export const runTeamsAssistantAgentOrThrow = async ({
  requestText,
  history,
  workspaceMemberId,
  deadlineAtMs,
}: {
  requestText: string;
  history: TeamsAssistantTurn[];
  workspaceMemberId: string;
  deadlineAtMs: number;
}): Promise<string> => {
  if (deadlineAtMs <= Date.now()) {
    throw new Error('Teams deadline passed before the agent could start');
  }

  let deadlineTimer: ReturnType<typeof setTimeout> | undefined;

  const deadline = new Promise<never>((_, reject) => {
    deadlineTimer = setTimeout(
      () => reject(new Error('Agent did not answer before the Teams deadline')),
      Math.max(deadlineAtMs - Date.now(), 0),
    );
  });

  try {
    // TODO(@abdulrahmancodes): send `input` instead of the deprecated `messages` once the app builds against a twenty-sdk that ships it
    const agentResult = await Promise.race([
      runAgent({
        agentUniversalIdentifier: TEAMS_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER,
        runAsWorkspaceMemberId: workspaceMemberId,
        messages: [
          ...history.flatMap((turn): TeamsAssistantAgentMessage[] => [
            { role: 'user', content: turn.requestText },
            { role: 'assistant', content: turn.responseText },
          ]),
          {
            role: 'user',
            content: `You are acting as workspace member ${workspaceMemberId}, with that member's own permissions. "Me", "my" and "mine" refer to that member.\n\nRequest from Teams:\n${requestText}`,
          },
        ],
      }),
      deadline,
    ]);

    if (!agentResult.success || agentResult.result === null) {
      throw new Error(agentResult.error ?? 'Agent run failed');
    }

    const responseText = hasResponseText(agentResult.result)
      ? agentResult.result.response.trim()
      : '';

    if (!isNonEmptyString(responseText)) {
      throw new Error('Agent returned an empty response');
    }

    return responseText;
  } finally {
    clearTimeout(deadlineTimer);
  }
};
