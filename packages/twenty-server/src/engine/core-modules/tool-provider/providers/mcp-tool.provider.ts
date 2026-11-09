import { Injectable } from '@nestjs/common';

import { McpError } from '@modelcontextprotocol/sdk/types.js';
import { PROPOSE_TOOL_CALL_TOOL_NAME, ToolCategory } from 'twenty-shared/ai';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { canCallerReachApplication } from 'src/engine/core-modules/application/utils/can-caller-reach-application.util';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { type GenerateDescriptorOptions } from 'src/engine/core-modules/tool-provider/interfaces/generate-descriptor-options.type';
import { type ToolProvider } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type McpToolTarget } from 'src/engine/core-modules/tool-provider/types/mcp-tool-target.type';
import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { type ToolExecutionRef } from 'src/engine/core-modules/tool-provider/types/tool-execution-ref.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { buildMcpToolTargets } from 'src/engine/core-modules/tool-provider/utils/build-mcp-tool-targets.util';
import { fromMcpToolTargetToToolIndexEntry } from 'src/engine/core-modules/tool-provider/utils/from-mcp-tool-target-to-tool-index-entry.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatMcpServer } from 'src/engine/metadata-modules/flat-mcp-server/types/flat-mcp-server.type';
import {
  McpServerException,
  McpServerExceptionCode,
} from 'src/engine/metadata-modules/mcp-server/mcp-server.exception';
import { McpServerClientService } from 'src/engine/metadata-modules/mcp-server/services/mcp-server-client.service';
import { McpServerToolSyncService } from 'src/engine/metadata-modules/mcp-server/services/mcp-server-tool-sync.service';
import { fromCallToolResultToToolOutput } from 'src/engine/metadata-modules/mcp-server/utils/from-call-tool-result-to-tool-output.util';
import { isDestructiveMcpServerTool } from 'src/engine/metadata-modules/mcp-server/utils/is-destructive-mcp-server-tool.util';
import { isMcpServerDueForToolSync } from 'src/engine/metadata-modules/mcp-server/utils/is-mcp-server-due-for-tool-sync.util';
import { isMcpUnknownToolError } from 'src/engine/metadata-modules/mcp-server/utils/is-mcp-unknown-tool-error.util';
import { isMcpUnknownToolMessage } from 'src/engine/metadata-modules/mcp-server/utils/is-mcp-unknown-tool-message.util';

const CATALOG_TOOL_SYNC_TIMEOUT_MS = 5_000;

type RemoteToolCallOutcome = {
  output: ToolOutput;
  isToolUnknownToServer: boolean;
};

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
    const hasSyncedAny = await this.syncServersDueForToolSync({
      mcpServers,
      userWorkspaceId: context.userWorkspaceId,
    });
    const upToDateMcpServers = hasSyncedAny
      ? await this.findReachableMcpServers(context)
      : mcpServers;

    return buildMcpToolTargets(upToDateMcpServers).map((target) => {
      const indexEntry = fromMcpToolTargetToToolIndexEntry(target);

      return includeSchemas
        ? { ...indexEntry, inputSchema: target.tool.inputSchema }
        : indexEntry;
    });
  }

  // Unreachable: MCP descriptors carry an mcp_server_tool ref, dispatched to executeMcpServerTool.
  async executeStaticTool(
    toolName: string,
    _args: Record<string, unknown>,
    _context: ToolProviderContext,
  ): Promise<ToolOutput> {
    throw new Error(
      `McpToolProvider does not emit static-kind descriptors (tool: ${toolName})`,
    );
  }

  async executeMcpServerTool({
    toolName,
    executionRef,
    toolArguments,
    context,
  }: {
    toolName: string;
    executionRef: Extract<ToolExecutionRef, { kind: 'mcp_server_tool' }>;
    toolArguments: Record<string, unknown>;
    context: ToolProviderContext;
  }): Promise<ToolOutput> {
    const mcpServer = (await this.findReachableMcpServers(context)).find(
      ({ id }) => id === executionRef.mcpServerId,
    );
    const tool = mcpServer?.tools.find(
      ({ name }) => name === executionRef.toolName,
    );

    if (!isDefined(mcpServer) || !isDefined(tool)) {
      return {
        success: false,
        message: `Tool ${toolName} is not offered by any MCP server`,
        error: 'Unknown MCP tool',
      };
    }

    const target: McpToolTarget = { name: toolName, mcpServer, tool };

    if (
      isDestructiveMcpServerTool(tool) &&
      context.approvedToolName !== toolName
    ) {
      return {
        success: false,
        message: `Tool ${toolName} requires approval`,
        error: `${toolName} may change data: propose it with ${PROPOSE_TOOL_CALL_TOOL_NAME} and let the user approve it.`,
      };
    }

    const { output, isToolUnknownToServer } = await this.callRemoteTool({
      target,
      toolArguments,
      userWorkspaceId: context.userWorkspaceId,
    });

    if (!isToolUnknownToServer) {
      return output;
    }

    await this.mcpServerToolSyncService.syncTools({
      ...mcpServer,
      userWorkspaceId: context.userWorkspaceId,
    });

    return {
      success: false,
      message: `MCP server ${mcpServer.label} does not know ${tool.name}; its tool list was refreshed, learn its tools again`,
      error: output.error,
    };
  }

  private async callRemoteTool({
    target: { name, mcpServer, tool },
    toolArguments,
    userWorkspaceId,
  }: {
    target: McpToolTarget;
    toolArguments: Record<string, unknown>;
    userWorkspaceId: string | undefined;
  }): Promise<RemoteToolCallOutcome> {
    try {
      const output = fromCallToolResultToToolOutput({
        toolName: name,
        result: await this.mcpServerClientService.callTool({
          target: { ...mcpServer, userWorkspaceId },
          toolName: tool.name,
          toolArguments,
        }),
      });

      return {
        output,
        isToolUnknownToServer:
          !output.success && isMcpUnknownToolMessage(output.error ?? ''),
      };
    } catch (error) {
      if (error instanceof McpError) {
        return {
          output: {
            success: false,
            message: `MCP tool ${name} failed`,
            error: error.message,
          },
          isToolUnknownToServer: isMcpUnknownToolError(error),
        };
      }

      if (
        error instanceof McpServerException &&
        error.code === McpServerExceptionCode.MCP_SERVER_NOT_CONNECTED
      ) {
        return {
          output: {
            success: false,
            message: `MCP tool ${name} failed`,
            error: `Connect an account for the ${mcpServer.label} MCP server before using its tools.`,
          },
          isToolUnknownToServer: false,
        };
      }

      throw error;
    }
  }

  private async findReachableMcpServers({
    workspaceId,
    application,
    authContext,
  }: Pick<
    ToolProviderContext,
    'workspaceId' | 'application' | 'authContext'
  >): Promise<FlatMcpServer[]> {
    const { flatMcpServerMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatMcpServerMaps'],
        },
      );

    return Object.values(flatMcpServerMaps.byUniversalIdentifier).filter(
      (mcpServer): mcpServer is FlatMcpServer =>
        isDefined(mcpServer) &&
        mcpServer.isActive &&
        canCallerReachApplication({
          callingApplication: application,
          applicationId: mcpServer.applicationId,
          operation: 'trigger',
          workspaceCustomApplicationId:
            authContext?.workspace.workspaceCustomApplicationId,
        }),
    );
  }

  private async syncServersDueForToolSync({
    mcpServers,
    userWorkspaceId,
  }: {
    mcpServers: FlatMcpServer[];
    userWorkspaceId: string | undefined;
  }): Promise<boolean> {
    const now = new Date();
    const syncOutcomes = await Promise.all(
      mcpServers
        .filter((mcpServer) => isMcpServerDueForToolSync({ mcpServer, now }))
        .map(async (mcpServer) => {
          const target = { ...mcpServer, userWorkspaceId };

          if (!(await this.mcpServerClientService.canCallerConnect(target))) {
            return false;
          }

          await this.mcpServerToolSyncService.syncTools({
            ...target,
            timeoutMs: CATALOG_TOOL_SYNC_TIMEOUT_MS,
          });

          return true;
        }),
    );

    return syncOutcomes.some((hasSynced) => hasSynced);
  }
}
