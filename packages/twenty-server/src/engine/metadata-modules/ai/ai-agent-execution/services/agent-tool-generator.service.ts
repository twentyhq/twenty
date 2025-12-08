import { Injectable, Logger } from '@nestjs/common';

import { type ToolSet } from 'ai';

import type { ActorMetadata } from 'twenty-shared/types';

import { ToolCategory } from 'src/engine/core-modules/tool-provider/enums/tool-category.enum';
import { ToolProviderService } from 'src/engine/core-modules/tool-provider/services/tool-provider.service';
import type { ToolHints } from 'src/engine/metadata-modules/ai/ai-chat-router/types/tool-hints.interface';

@Injectable()
export class AgentToolGeneratorService {
  private readonly logger = new Logger(AgentToolGeneratorService.name);

  constructor(private readonly toolProvider: ToolProviderService) {}

  // Generates base tools for chat context (DATABASE_CRUD and ACTION)
  // Additional tools (WORKFLOW, METADATA) are provided via additionalTools
  // from ChatToolsProviderService to avoid circular dependencies
  async generateToolsForAgent(
    agentId: string,
    workspaceId: string,
    actorContext?: ActorMetadata,
    roleIds?: string[],
    toolHints?: ToolHints,
  ): Promise<ToolSet> {
    try {
      return await this.toolProvider.getTools({
        workspaceId,
        categories: [ToolCategory.DATABASE_CRUD, ToolCategory.ACTION],
        rolePermissionConfig: roleIds ? { intersectionOf: roleIds } : undefined,
        actorContext,
        toolHints,
        wrapWithErrorContext: true,
      });
    } catch (toolError) {
      const errorMessage =
        toolError instanceof Error ? toolError.message : 'Unknown error';

      this.logger.warn(
        `Failed to generate tools for agent ${agentId}: ${errorMessage}. Proceeding without tools.`,
      );

      return {};
    }
  }
}
