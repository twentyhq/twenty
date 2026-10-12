import { isDefined } from 'twenty-shared/utils';

import { PAUSING_TOOLS } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/constants/pausing-tools.constant';
import { readToolCallStatus } from 'src/engine/metadata-modules/ai/ai-history/utils/read-tool-call-status.util';
import { type AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { type AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';

// a pending call is skipped, and one still running had its outcome lost, so it closes as interrupted
export const closeOpenToolParts = async ({
  messagePartRepository,
  messageId,
  workspaceId,
}: {
  messagePartRepository: AgentHistoryRepository<AgentMessagePartWorkspaceEntity>;
  messageId: string;
  workspaceId: string;
}): Promise<void> => {
  const parts = await messagePartRepository.find(workspaceId, {
    where: { messageId },
    select: ['id', 'toolName', 'toolInput', 'toolOutput'],
  });

  for (const part of parts) {
    const pausingTool = isDefined(part.toolName)
      ? PAUSING_TOOLS.get(part.toolName)
      : undefined;

    if (!isDefined(pausingTool)) {
      continue;
    }

    const status = readToolCallStatus(part.toolOutput);
    const isAwaiting = status === 'pending';
    const pausingToolCall =
      isAwaiting || status === 'running'
        ? pausingTool.parseCall(part.toolInput, part.toolOutput)
        : null;
    const closedToolOutput = isAwaiting
      ? pausingToolCall?.toSkippedToolResult()
      : pausingToolCall?.toInterruptedToolResult?.();

    if (!isDefined(closedToolOutput)) {
      continue;
    }

    // written only while the call is as it was read, so an answer recorded meanwhile is kept, and
    // the rest of the output, such as the workflow step that posted the call, stays readable
    await messagePartRepository.query(workspaceId, ({ manager, table }) =>
      manager.query(
        `UPDATE ${table('agentMessagePart')} SET "toolOutput" = "toolOutput" || $2::jsonb, "updatedAt" = now()
         WHERE id = $1 AND "toolOutput"->'result'->>'status' = $3`,
        [part.id, JSON.stringify(closedToolOutput), status],
      ),
    );
  }
};
