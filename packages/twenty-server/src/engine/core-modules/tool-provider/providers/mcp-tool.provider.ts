import { Injectable } from '@nestjs/common';

import { ToolCategory } from 'twenty-shared/ai';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { canCallerReachApplication } from 'src/engine/core-modules/application/utils/can-caller-reach-application.util';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { type GenerateDescriptorOptions } from 'src/engine/core-modules/tool-provider/interfaces/generate-descriptor-options.type';
import { type ToolProvider } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { buildMcpToolName } from 'src/engine/core-modules/tool-provider/utils/build-mcp-tool-name.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';
import { McpServerClientService } from 'src/engine/metadata-modules/mcp-server/services/mcp-server-client.service';
import { McpServerToolSyncService } from 'src/engine/metadata-modules/mcp-server/services/mcp-server-tool-sync.service';
import { type McpServerTool } from 'src/engine/metadata-modules/mcp-server/types/mcp-server-tool.type';
import { fromCallToolResultToToolOutput } from 'src/engine/metadata-modules/mcp-server/utils/from-call-tool-result-to-tool-output.util';
import { isMcpUnknownToolError } from 'src/engine/metadata-modules/mcp-server/utils/is-mcp-unknown-tool-error.util';

const MCP_TOOL_ICON = 'IconSparkles';
// A server that failed its last sync is retried from chat at most this often.
const UNSYNCED_SERVER_RETRY_MS = 5 * 60 * 1000;

type McpToolTarget = { mcpServer: FlatMcpServer; tool: McpServerTool };

@Injectable()
export class McpToolProvider implements ToolProvider {
  readonly category = ToolCategory.MCP;

  constructor(
    private readonly featureFlagService: FeatureFlagService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly mcpServerClientService: McpServerClientService,
    private readonly mcpServerToolSyncService: McpServerToolSyncService,
  ) {}

  async isAvailable(context: ToolProviderContext): Promise<boolean> {
    return this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_MCP_SERVERS_ENABLED,
      context.workspaceId,
    );
  }

  async generateDescriptors(
    context: ToolProviderContext,
    options?: GenerateDescriptorOptions,
  ): Promise<(ToolIndexEntry | ToolDescriptor)[]> {
    const includeSchemas = options?.includeSchemas ?? true;
    const mcpServers = await this.findReachableMcpServers(context);
    const hasSyncedAny = await this.syncServersNeverSynced(mcpServers, context);
    const upToDateMcpServers = hasSyncedAny
      ? await this.findReachableMcpServers(context)
      : mcpServers;

    return upToDateMcpServers.flatMap((mcpServer) =>
      mcpServer.tools.map((tool) => {
        const base = this.buildIndexEntry({ mcpServer, tool });

        return includeSchemas
          ? { ...base, inputSchema: tool.inputSchema }
          : base;
      }),
    );
  }

  async executeStaticTool(
    toolName: string,
    args: Record<string, unknown>,
    context: ToolProviderContext,
  ): Promise<ToolOutput> {
    const target = await this.findToolTarget(toolName, context);

    if (!isDefined(target)) {
      return {
        success: false,
        message: `Tool ${toolName} is not offered by any MCP server`,
        error: 'Unknown MCP tool',
      };
    }

    const { mcpServer, tool } = target;
    const serverTarget = {
      ...mcpServer,
      userWorkspaceId: context.userWorkspaceId,
    };

    try {
      const result = await this.mcpServerClientService.callTool({
        target: serverTarget,
        toolName: tool.name,
        toolArguments: args,
      });

      return fromCallToolResultToToolOutput({ toolName, result });
    } catch (error) {
      if (!isMcpUnknownToolError(error)) {
        throw error;
      }

      await this.mcpServerToolSyncService.syncTools(serverTarget);

      return {
        success: false,
        message: `MCP server ${mcpServer.label} no longer offers ${tool.name}; its tool list was refreshed`,
        error: 'Unknown MCP tool',
      };
    }
  }

  private async findReachableMcpServers(
    context: ToolProviderContext,
  ): Promise<FlatMcpServer[]> {
    const { flatMcpServerMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId: context.workspaceId,
          flatMapsKeys: ['flatMcpServerMaps'],
        },
      );

    return Object.values(flatMcpServerMaps.byUniversalIdentifier).filter(
      (mcpServer): mcpServer is FlatMcpServer =>
        isDefined(mcpServer) &&
        mcpServer.isActive &&
        canCallerReachApplication({
          callingApplication: context.application,
          applicationId: mcpServer.applicationId,
          operation: 'trigger',
          workspaceCustomApplicationId:
            context.authContext?.workspace.workspaceCustomApplicationId,
        }),
    );
  }

  // A server created before its account existed has an empty list: fill it once the caller can connect.
  private async syncServersNeverSynced(
    mcpServers: FlatMcpServer[],
    context: ToolProviderContext,
  ): Promise<boolean> {
    const dueServers = mcpServers.filter(
      (mcpServer) =>
        !isDefined(mcpServer.toolsSyncedAt) &&
        (!isDefined(mcpServer.toolsSyncError) ||
          Date.now() - new Date(mcpServer.updatedAt).getTime() >
            UNSYNCED_SERVER_RETRY_MS),
    );

    let hasSyncedAny = false;

    for (const mcpServer of dueServers) {
      const target = { ...mcpServer, userWorkspaceId: context.userWorkspaceId };

      if (!(await this.mcpServerClientService.canCallerConnect(target))) {
        continue;
      }

      await this.mcpServerToolSyncService.syncTools(target);
      hasSyncedAny = true;
    }

    return hasSyncedAny;
  }

  private async findToolTarget(
    toolName: string,
    context: ToolProviderContext,
  ): Promise<McpToolTarget | undefined> {
    for (const mcpServer of await this.findReachableMcpServers(context)) {
      const tool = mcpServer.tools.find(
        (candidate) =>
          buildMcpToolName({
            mcpServerName: mcpServer.name,
            toolName: candidate.name,
          }) === toolName,
      );

      if (isDefined(tool)) {
        return { mcpServer, tool };
      }
    }

    return undefined;
  }

  private buildIndexEntry({ mcpServer, tool }: McpToolTarget): ToolIndexEntry {
    const name = buildMcpToolName({
      mcpServerName: mcpServer.name,
      toolName: tool.name,
    });
    const isDestructive =
      tool.annotations?.destructiveHint === true &&
      tool.annotations?.readOnlyHint !== true;

    return {
      name,
      label: tool.annotations?.title ?? tool.name,
      description: [
        tool.description ?? tool.name,
        `(MCP server: ${mcpServer.label})`,
        ...(isDestructive
          ? [
              'Destructive: propose it with propose_tool_call and wait for approval before running it.',
            ]
          : []),
      ].join(' '),
      category: ToolCategory.MCP,
      executionRef: { kind: 'static', toolId: name },
      icon: MCP_TOOL_ICON,
    };
  }
}
