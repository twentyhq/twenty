import { isDefined } from 'twenty-shared/utils';

import { findAwaitingPausingTool } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/find-awaiting-pausing-tool.util';
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
    const pausingToolCall = findAwaitingPausingTool(part)?.parseCall(
      part.toolInput,
      part.toolOutput,
    );

    if (isDefined(pausingToolCall)) {
      await messagePartRepository.update(
        workspaceId,
        { id: part.id },
        { toolOutput: pausingToolCall.toSkippedToolResult() },
      );
    }
  }
};
