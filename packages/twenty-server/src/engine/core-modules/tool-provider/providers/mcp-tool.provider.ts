import { Injectable } from '@nestjs/common';

import { type ToolApproval, ToolCategory } from 'twenty-shared/ai';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type GenerateDescriptorOptions } from 'src/engine/core-modules/tool-provider/interfaces/generate-descriptor-options.type';
import { type ToolProvider } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { canCallerReachApplication } from 'src/engine/core-modules/application/utils/can-caller-reach-application.util';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { buildMcpToolOutput } from 'src/engine/core-modules/tool-provider/utils/build-mcp-tool-output.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';
import { McpServerClientService } from 'src/engine/metadata-modules/mcp-server/services/mcp-server-client.service';
import { type McpServerTool } from 'src/engine/metadata-modules/mcp-server/types/mcp-server-tool.type';
import { buildMcpToolName } from 'src/engine/metadata-modules/mcp-server/utils/build-mcp-tool-name.util';
import { findMcpServerToolByToolName } from 'src/engine/metadata-modules/mcp-server/utils/find-mcp-server-tool-by-tool-name.util';

const GENERIC_APPROVAL: ToolApproval = { template: 'generic' };

@Injectable()
export class McpToolProvider implements ToolProvider {
  readonly category = ToolCategory.MCP;

  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly mcpServerClientService: McpServerClientService,
    private readonly applicationService: ApplicationService,
  ) {}

  async isAvailable(context: ToolProviderContext): Promise<boolean> {
    return this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_MCP_SERVERS_ENABLED,
      context.workspaceId,
    );
  }

  // Reads the cached tool list only: the remote tools/list is never fetched on a chat turn
  async generateDescriptors(
    context: ToolProviderContext,
    options?: GenerateDescriptorOptions,
  ): Promise<(ToolIndexEntry | ToolDescriptor)[]> {
    const includeSchemas = options?.includeSchemas ?? true;
    const [flatMcpServerMaps, workspaceCustomApplicationId] = await Promise.all(
      [
        this.getFlatMcpServerMaps(context.workspaceId),
        this.getWorkspaceCustomApplicationId(context.workspaceId),
      ],
    );

    const descriptors: (ToolIndexEntry | ToolDescriptor)[] = [];

    for (const flatMcpServer of Object.values(
      flatMcpServerMaps.byUniversalIdentifier,
    )) {
      if (
        !isDefined(flatMcpServer) ||
        !flatMcpServer.isEnabled ||
        !canCallerReachApplication({
          callingApplication: context.application,
          applicationId: flatMcpServer.applicationId,
        })
      ) {
        continue;
      }

      for (const tool of flatMcpServer.tools) {
        const toolName = buildMcpToolName({
          mcpServerName: flatMcpServer.name,
          toolName: tool.name,
          isApplicationOwned:
            flatMcpServer.applicationId !== workspaceCustomApplicationId,
        });

        if (isDefined(options?.toolNames) && !options.toolNames.has(toolName)) {
          continue;
        }

        descriptors.push(
          this.buildDescriptor({
            toolName,
            flatMcpServer,
            tool,
            includeSchemas,
          }),
        );
      }
    }

    return descriptors;
  }

  async executeStaticTool(
    toolName: string,
    args: Record<string, unknown>,
    context: ToolProviderContext,
  ): Promise<ToolOutput> {
    const [flatMcpServerMaps, workspaceCustomApplicationId] = await Promise.all(
      [
        this.getFlatMcpServerMaps(context.workspaceId),
        this.getWorkspaceCustomApplicationId(context.workspaceId),
      ],
    );

    const match = findMcpServerToolByToolName({
      flatMcpServerMaps,
      toolName,
      workspaceCustomApplicationId,
    });

    if (
      !isDefined(match) ||
      !canCallerReachApplication({
        callingApplication: context.application,
        applicationId: match.flatMcpServer.applicationId,
      })
    ) {
      return {
        success: false,
        message: `${toolName} is not available`,
        error: 'No enabled MCP server exposes this tool',
      };
    }

    try {
      const result = await this.mcpServerClientService.callTool({
        mcpServer: match.flatMcpServer,
        toolName: match.tool.name,
        args,
        userId: context.userId,
      });

      return buildMcpToolOutput({ toolName, result });
    } catch (error) {
      return {
        success: false,
        message: `${toolName} failed`,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async getWorkspaceCustomApplicationId(
    workspaceId: string,
  ): Promise<string> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    return workspaceCustomFlatApplication.id;
  }

  private async getFlatMcpServerMaps(workspaceId: string) {
    const { flatMcpServerMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        { workspaceId, flatMapsKeys: ['flatMcpServerMaps'] },
      );

    return flatMcpServerMaps;
  }

  private buildDescriptor({
    toolName,
    flatMcpServer,
    tool,
    includeSchemas,
  }: {
    toolName: string;
    flatMcpServer: FlatMcpServer;
    tool: McpServerTool;
    includeSchemas: boolean;
  }): ToolIndexEntry | ToolDescriptor {
    const base: ToolIndexEntry = {
      name: toolName,
      label: `${flatMcpServer.label}: ${tool.name}`,
      description: tool.description ?? `${tool.name} on ${flatMcpServer.label}`,
      category: ToolCategory.MCP,
      icon: 'IconPlug',
      executionRef: { kind: 'static', toolId: toolName },
      ...(this.isDestructive(tool) && { approval: GENERIC_APPROVAL }),
    };

    return includeSchemas ? { ...base, inputSchema: tool.inputSchema } : base;
  }

  private isDestructive(tool: McpServerTool): boolean {
    return (
      tool.annotations?.destructiveHint === true ||
      tool.annotations?.readOnlyHint === false
    );
  }
}
