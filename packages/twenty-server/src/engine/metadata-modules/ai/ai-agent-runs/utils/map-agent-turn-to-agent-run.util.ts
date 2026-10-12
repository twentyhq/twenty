import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { toDisplayCredits } from 'src/engine/core-modules/usage/utils/to-display-credits.util';
import { type AgentRunDTO } from 'src/engine/metadata-modules/ai/ai-agent-runs/dtos/agent-run.dto';
import { AgentMessageRole } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-message-role.enum';
import { type AgentTurnWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-turn.workspace-entity';

type AgentRunMessagePart = {
  orderIndex: number;
  type: string;
  textContent: string | null;
  toolName: string | null;
};

type AgentRunMessage = {
  role: string;
  agentId: string | null;
  createdAt: string | Date;
  parts?: AgentRunMessagePart[] | null;
};

type AgentRunSourceTurn = Pick<
  AgentTurnWorkspaceEntity,
  | 'id'
  | 'threadId'
  | 'status'
  | 'error'
  | 'createdAt'
  | 'startedAt'
  | 'endedAt'
  | 'modelId'
  | 'inputTokens'
  | 'outputTokens'
  | 'inputCredits'
  | 'outputCredits'
  | 'createdBy'
> & {
  thread?: { title: string | null } | null;
  messages?: AgentRunMessage[] | null;
};

const sortParts = (parts: AgentRunMessagePart[] | null | undefined) =>
  [...(parts ?? [])].sort((left, right) => left.orderIndex - right.orderIndex);

const joinText = (messages: AgentRunMessage[]): string | null => {
  const text = messages
    .flatMap((message) => sortParts(message.parts))
    .filter(
      (part) => part.type === 'text' && isNonEmptyString(part.textContent),
    )
    .map((part) => part.textContent)
    .join('\n\n')
    .trim();

  return isNonEmptyString(text) ? text : null;
};

const toDate = (value: string | null): Date | null =>
  isDefined(value) ? new Date(value) : null;

// usage is empty on turns recorded before it was counted
const toCredits = (
  inputCredits: string | null,
  outputCredits: string | null,
): number | null =>
  isDefined(inputCredits) || isDefined(outputCredits)
    ? toDisplayCredits(Number(inputCredits ?? 0) + Number(outputCredits ?? 0))
    : null;

export const mapAgentTurnToAgentRun = (
  turn: AgentRunSourceTurn,
): AgentRunDTO => {
  // the ORM returns timestamps as dates although the entity types them as strings
  const messages = [...(turn.messages ?? [])].sort(
    (left, right) =>
      new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
  );
  // replies a caller hands over are input too; only messages the agent wrote carry its id
  const agentMessages = messages.filter(
    (message) =>
      message.role === AgentMessageRole.ASSISTANT && isDefined(message.agentId),
  );
  const inputMessages = messages.filter(
    (message) => !isDefined(message.agentId),
  );
  const lastAgentMessage = agentMessages[agentMessages.length - 1];

  return {
    id: turn.id,
    threadId: turn.threadId,
    threadTitle: turn.thread?.title ?? null,
    status: turn.status,
    errorMessage: turn.error?.message ?? null,
    createdAt: new Date(turn.createdAt),
    startedAt: toDate(turn.startedAt),
    endedAt: toDate(turn.endedAt),
    modelId: isNonEmptyString(turn.modelId) ? turn.modelId : null,
    inputTokens: turn.inputTokens,
    outputTokens: turn.outputTokens,
    credits: toCredits(turn.inputCredits, turn.outputCredits),
    creatorSource: turn.createdBy.source,
    creatorName: turn.createdBy.name,
    input: joinText(inputMessages),
    reply: isDefined(lastAgentMessage) ? joinText([lastAgentMessage]) : null,
    toolNames: [
      ...new Set(
        agentMessages
          .flatMap((message) => sortParts(message.parts))
          .map((part) => part.toolName)
          .filter(isNonEmptyString),
      ),
    ],
  };
};
