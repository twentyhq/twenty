import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { type GenerateDescriptorOptions } from 'src/engine/core-modules/tool-provider/interfaces/generate-descriptor-options.type';
import { type ToolProvider } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { executeToolFromToolSet } from 'src/engine/core-modules/tool-provider/utils/execute-tool-from-tool-set.util';
import { toolSetToDescriptors } from 'src/engine/core-modules/tool-provider/utils/tool-set-to-descriptors.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { AgentToolWorkspaceService } from 'src/engine/metadata-modules/ai/ai-agent/tools/services/agent-tool.workspace-service';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

@Injectable()
export class AgentToolProvider implements ToolProvider {
  readonly category = ToolCategory.AGENT;

  constructor(
    private readonly agentToolWorkspaceService: AgentToolWorkspaceService,
    private readonly permissionsService: PermissionsService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  async isAvailable(context: ToolProviderContext): Promise<boolean> {
    const isAiChatInboxEnabled = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
      context.workspaceId,
    );

    if (!isAiChatInboxEnabled) {
      return false;
    }

    return this.permissionsService.checkRolesPermissions(
      context.rolePermissionConfig,
      context.workspaceId,
      PermissionFlagType.AI_SETTINGS,
    );
  }

  async generateDescriptors(
    context: ToolProviderContext,
    options?: GenerateDescriptorOptions,
  ): Promise<(ToolIndexEntry | ToolDescriptor)[]> {
    return toolSetToDescriptors(
      this.buildToolSet(context),
      ToolCategory.AGENT,
      { includeSchemas: options?.includeSchemas ?? true },
    );
  }

  async executeStaticTool(
    toolName: string,
    args: Record<string, unknown>,
    context: ToolProviderContext,
  ): Promise<ToolOutput> {
    return executeToolFromToolSet(
      this.buildToolSet(context),
      toolName,
      args,
      ToolCategory.AGENT,
    );
  }

  private buildToolSet(context: ToolProviderContext): ToolSet {
    return this.agentToolWorkspaceService.generateAgentTools({
      workspaceId: context.workspaceId,
      callingApplication: context.application,
    });
  }
}
