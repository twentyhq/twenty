import { isNonEmptyString } from '@sniptt/guards';
import { getToolName, isToolUIPart } from 'ai';
import { type ExtendedUIMessagePart } from 'twenty-shared/ai';
import { type AiRunEvent, type AiRunUsage } from 'twenty-shared/application';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { AGENT_WAIT_TOOL_NAMES } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/constants/agent-wait-tool-names.constant';
import { PAUSING_TOOLS } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/constants/pausing-tools.constant';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { AgentMessageStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-status.enum';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { type AgentTurnWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-turn.workspace-entity';
import { type AgentConversationActor } from 'src/engine/metadata-modules/ai/ai-history/types/agent-conversation-actor.type';
import { filterPartsOfTurnActedByOthers } from 'src/engine/metadata-modules/ai/ai-history/utils/filter-parts-of-turn-acted-by-others.util';
import { findTurnIdsActedByOthers } from 'src/engine/metadata-modules/ai/ai-history/utils/find-turn-ids-acted-by-others.util';
import { isAwaitingPausingToolOutput } from 'src/engine/metadata-modules/ai/ai-history/utils/is-awaiting-pausing-tool-output.util';
import { mapDBPartsToUIMessageParts } from 'src/engine/metadata-modules/ai/ai-history/utils/map-db-parts-to-ui-message-parts.util';

export type AiRunTurn = Pick<
  AgentTurnWorkspaceEntity,
  | 'id'
  | 'status'
  | 'error'
  | 'createdAt'
  | 'updatedAt'
  | 'startedAt'
  | 'endedAt'
  | 'inputTokens'
  | 'outputTokens'
>;

export type AiRunMessage = Pick<
  AgentMessageWorkspaceEntity,
  | 'id'
  | 'turnId'
  | 'role'
  | 'status'
  | 'createdAt'
  | 'senderWorkspaceMemberId'
  | 'senderApplicationId'
  | 'parts'
>;

type AiRunEventSource = { runId: string; createdAt: string };

// the ORM returns timestamps as dates although the entities type them as strings
const toIsoString = (value: string | Date): string =>
  new Date(value).toISOString();

const isInteractionToolName = (toolName: string): boolean =>
  PAUSING_TOOLS.has(toolName) || AGENT_WAIT_TOOL_NAMES.includes(toolName);

const buildUsage = ({
  inputTokens,
  outputTokens,
}: Pick<AiRunTurn, 'inputTokens' | 'outputTokens'>): AiRunUsage | null =>
  isDefined(inputTokens) || isDefined(outputTokens)
    ? { inputTokens: inputTokens ?? 0, outputTokens: outputTokens ?? 0 }
    : null;

// one list per model step, since a step's tool results come in whatever order its tools finish
const buildPartEventSteps = ({
  messageId,
  role,
  parts,
  source,
}: {
  messageId: string;
  role: 'user' | 'assistant';
  parts: ExtendedUIMessagePart[];
  source: AiRunEventSource;
}): AiRunEvent[][] => {
  let textIndex = -1;
  const steps: AiRunEvent[][] = [[]];

  for (const part of parts) {
    const step = steps[steps.length - 1];

    if (part.type === 'step-start') {
      steps.push([]);
      continue;
    }

    if (part.type === 'text') {
      textIndex += 1;

      if (isNonEmptyString(part.text) && part.state !== 'streaming') {
        step.push({
          ...source,
          id: `${messageId}:text:${textIndex}`,
          type: 'MESSAGE',
          role,
          text: part.text,
        });
      }

      continue;
    }

    if (!isToolUIPart(part) || part.state === 'input-streaming') {
      continue;
    }

    const toolName = getToolName(part);
    const result = {
      ...source,
      id: `${part.toolCallId}:result`,
      type: 'TOOL_RESULT' as const,
      toolCallId: part.toolCallId,
    };

    step.push({
      ...source,
      id: `${part.toolCallId}:call`,
      type: isInteractionToolName(toolName) ? 'INTERACTION' : 'TOOL_CALL',
      toolCallId: part.toolCallId,
      toolName,
      input: part.input,
    });

    if (part.state === 'output-error') {
      step.push({ ...result, output: part.errorText, isError: true });
      continue;
    }

    // a pending interaction is answered later, in place
    if (
      part.state === 'output-available' &&
      !part.preliminary &&
      !isAwaitingPausingToolOutput(part.output)
    ) {
      step.push({ ...result, output: part.output, isError: false });
    }
  }

  return steps.filter(isNonEmptyArray);
};

const buildEndEvent = (turn: AiRunTurn): AiRunEvent | null => {
  const source = {
    runId: turn.id,
    createdAt: toIsoString(turn.endedAt ?? turn.updatedAt),
  };

  switch (turn.status) {
    case AgentTurnStatus.COMPLETED:
      return {
        ...source,
        id: `${turn.id}:completed`,
        type: 'RUN_COMPLETED',
        usage: buildUsage(turn),
      };
    case AgentTurnStatus.FAILED:
    case AgentTurnStatus.CANCELLED:
      return {
        ...source,
        id: `${turn.id}:failed`,
        type: 'RUN_FAILED',
        error:
          turn.status === AgentTurnStatus.CANCELLED
            ? 'The run was cancelled'
            : (turn.error?.message ?? 'The run failed'),
        usage: buildUsage(turn),
      };
    default:
      return null;
  }
};

// a running turn's reply comes from its stream, since its checkpoint marks running tools interrupted
export const buildAiRunEvents = ({
  turns,
  messages,
  streamedMessage,
  actor,
}: {
  turns: AiRunTurn[];
  messages: AiRunMessage[];
  streamedMessage: { id: string; parts: ExtendedUIMessagePart[] } | null;
  actor: AgentConversationActor;
}): AiRunEvent[][] => {
  const sentMessages = messages.filter(
    ({ status }) => status !== AgentMessageStatus.QUEUED,
  );
  const turnIdsActedByOthers = findTurnIdsActedByOthers({
    messages: sentMessages,
    actor,
  });

  return turns.flatMap((turn) => {
    const messageSteps = sentMessages
      .filter(
        ({ turnId, role }) =>
          turnId === turn.id && role !== AgentMessageRole.SYSTEM,
      )
      .flatMap((message) => {
        const parts =
          message.id === streamedMessage?.id &&
          turn.status === AgentTurnStatus.RUNNING
            ? streamedMessage.parts
            : mapDBPartsToUIMessageParts(message.parts ?? []);

        return buildPartEventSteps({
          messageId: message.id,
          role: message.role === AgentMessageRole.USER ? 'user' : 'assistant',
          parts: turnIdsActedByOthers.has(turn.id)
            ? filterPartsOfTurnActedByOthers(parts)
            : parts,
          source: {
            runId: turn.id,
            createdAt: toIsoString(message.createdAt),
          },
        });
      });

    const endEvent = buildEndEvent(turn);

    return [
      [
        {
          id: `${turn.id}:started`,
          runId: turn.id,
          type: 'RUN_STARTED' as const,
          createdAt: toIsoString(turn.startedAt ?? turn.createdAt),
        },
      ],
      ...messageSteps,
      ...(isDefined(endEvent) ? [[endEvent]] : []),
    ];
  });
};
