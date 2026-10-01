import { isDefined } from 'twenty-shared/utils';

import { PAUSING_TOOLS } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/constants/pausing-tools.constant';
import { type AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { type AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';

export const skipAwaitingToolParts = async ({
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
    const pausingToolCall = pausingTool?.isAwaitingOutput(part.toolOutput)
      ? pausingTool.parseCall(part.toolInput)
      : null;

    if (isDefined(pausingToolCall)) {
      await messagePartRepository.update(
        workspaceId,
        { id: part.id },
        { toolOutput: pausingToolCall.toSkippedToolResult() },
      );
    }
  }
};
