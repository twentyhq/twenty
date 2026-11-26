import { isNonEmptyString, isString } from '@sniptt/guards';
import { runAgent } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { TELEGRAM_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { TelegramAssistantDeadlineError } from 'src/logic-functions/types/telegram-assistant-deadline-error';
import { TelegramAssistantEmptyResponseError } from 'src/logic-functions/types/telegram-assistant-empty-response-error';
import { type TelegramAssistantTurn } from 'src/logic-functions/types/telegram-assistant-turn.type';
import { buildTelegramAssistantMessages } from 'src/logic-functions/utils/build-telegram-assistant-messages';
import { raceAgainstTimeoutOrThrow } from 'src/logic-functions/utils/race-against-timeout-or-throw';

const hasResponseText = (result: object): result is { response: string } =>
  'response' in result && isString(result.response);

export const runTelegramAssistantAgentOrThrow = async ({
  requestText,
  history,
  workspaceMemberId,
  workspaceBaseUrl,
  deadlineAtMs,
}: {
  requestText: string;
  history: TelegramAssistantTurn[];
  workspaceMemberId: string;
  workspaceBaseUrl: string | undefined;
  deadlineAtMs: number;
}): Promise<string> => {
  const remainingMs = deadlineAtMs - Date.now();

  if (remainingMs <= 0) {
    throw new TelegramAssistantDeadlineError(
      'Telegram deadline passed before the agent could start',
    );
  }

  const agentResult = await raceAgainstTimeoutOrThrow({
    promise: runAgent({
      agentUniversalIdentifier: TELEGRAM_ASSISTANT_AGENT_UNIVERSAL_IDENTIFIER,
      runAsWorkspaceMemberId: workspaceMemberId,
      input: buildTelegramAssistantMessages({
        requestText,
        history,
        workspaceMemberId,
        workspaceBaseUrl,
        timeoutSeconds: Math.ceil(remainingMs / 1000),
      }),
    }),
    timeoutMs: remainingMs,
    timeoutError: new TelegramAssistantDeadlineError(
      'Agent did not answer before the Telegram deadline',
    ),
  });

  if (!agentResult.success || !isDefined(agentResult.result)) {
    throw new Error(agentResult.error ?? 'Agent run failed');
  }

  const responseText = hasResponseText(agentResult.result)
    ? agentResult.result.response.trim()
    : '';

  if (!isNonEmptyString(responseText)) {
    throw new TelegramAssistantEmptyResponseError(
      'Agent returned an empty response',
    );
  }

  return responseText;
};
