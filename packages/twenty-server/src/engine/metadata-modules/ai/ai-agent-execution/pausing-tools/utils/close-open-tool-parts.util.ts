import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { PAUSING_TOOLS } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/constants/pausing-tools.constant';
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

    const closedToolOutput = pausingTool.isAwaitingOutput(part.toolOutput)
      ? pausingTool
          .parseCall(part.toolInput, part.toolOutput)
          ?.toSkippedToolResult()
      : pausingTool.isRunningOutput(part.toolOutput)
        ? pausingTool
            .parseCall(part.toolInput, part.toolOutput)
            ?.toInterruptedToolResult?.()
        : undefined;

    // the rest of the output, such as the workflow step that posted the call, stays readable
    if (isDefined(closedToolOutput)) {
      await messagePartRepository.update(
        workspaceId,
        { id: part.id },
        {
          toolOutput: {
            ...(isPlainObject(part.toolOutput) ? part.toolOutput : {}),
            ...closedToolOutput,
          },
        },
      );
    }
  }
};
