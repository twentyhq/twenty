import { isNonEmptyString } from '@sniptt/guards';
import { runAgent } from 'twenty-sdk/logic-function';

import { TEAMS_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER } from 'src/features/chat/constants/universal-identifiers';
import { TEAMS_ASSISTANT_DEADLINE_ERROR } from 'src/features/chat/logic-functions/constants/teams-assistant-deadline-error';
import { TEAMS_ASSISTANT_EMPTY_RESPONSE_ERROR } from 'src/features/chat/logic-functions/constants/teams-assistant-empty-response-error';
import { type TeamsAssistantTurn } from 'src/features/chat/logic-functions/types/teams-assistant-turn.type';
import { buildTeamsAssistantMessages } from 'src/features/chat/logic-functions/utils/build-teams-assistant-messages';

const hasResponseText = (result: object): result is { response: string } =>
  'response' in result && typeof result.response === 'string';

export const runTeamsAssistantAgentOrThrow = async ({
  requestText,
  history,
  workspaceMemberId,
  workspaceBaseUrl,
  deadlineAtMs,
}: {
  requestText: string;
  history: TeamsAssistantTurn[];
  workspaceMemberId: string;
  workspaceBaseUrl: string | undefined;
  deadlineAtMs: number;
}): Promise<string> => {
  if (deadlineAtMs <= Date.now()) {
    throw new Error(TEAMS_ASSISTANT_DEADLINE_ERROR);
  }

  let deadlineTimer: ReturnType<typeof setTimeout> | undefined;

  const deadline = new Promise<never>((_, reject) => {
    deadlineTimer = setTimeout(
      () => reject(new Error(TEAMS_ASSISTANT_DEADLINE_ERROR)),
      Math.max(deadlineAtMs - Date.now(), 0),
    );
  });

  try {
    // TODO(@abdulrahmancodes): send `input` instead of the deprecated `messages` once the app builds against a twenty-sdk that ships it
    const agentResult = await Promise.race([
      runAgent({
        agentUniversalIdentifier: TEAMS_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER,
        runAsWorkspaceMemberId: workspaceMemberId,
        messages: buildTeamsAssistantMessages({
          requestText,
          history,
          workspaceMemberId,
          workspaceBaseUrl,
          timeoutSeconds: Math.ceil((deadlineAtMs - Date.now()) / 1000),
        }),
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
      throw new Error(TEAMS_ASSISTANT_EMPTY_RESPONSE_ERROR);
    }

    return responseText;
  } finally {
    clearTimeout(deadlineTimer);
  }
};
