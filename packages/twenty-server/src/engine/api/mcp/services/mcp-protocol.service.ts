import { Injectable } from '@nestjs/common';

import {
  type CallToolRequest,
  type CallToolResult,
  type ListToolsResult,
  createMcpHandler,
  ProtocolError,
  Server,
  type ServerContext,
} from '@modelcontextprotocol/server';
import * as Sentry from '@sentry/node';
import { type ToolSet } from 'ai';
import { type ToolCategory } from 'twenty-shared/ai';
import { type ActorMetadata, FieldActorSource } from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS } from 'src/engine/api/mcp/constants/mcp-closed-world-read-only-tool-annotations.constant';
import { MCP_EXCLUDED_TOOL_NAMES } from 'src/engine/api/mcp/constants/mcp-excluded-tool-names.constant';
import { MCP_GENERIC_MODE_LISTED_TOOL_CATEGORIES } from 'src/engine/api/mcp/constants/mcp-generic-mode-listed-tool-categories.constant';
import { MCP_METHODS_RETURNING_INSTRUCTIONS } from 'src/engine/api/mcp/constants/mcp-methods-returning-instructions.constant';
import { MCP_RESULT_CACHE_HINTS } from 'src/engine/api/mcp/constants/mcp-result-cache-hints.constant';
import { MCP_SERVER_CAPABILITIES } from 'src/engine/api/mcp/constants/mcp-server-capabilities.constant';
import { MCP_EXECUTE_TOOL_ANNOTATIONS } from 'src/engine/api/mcp/constants/mcp-execute-tool-annotations.const';
import { MCP_OPEN_WORLD_READ_ONLY_TOOL_ANNOTATIONS } from 'src/engine/api/mcp/constants/mcp-open-world-read-only-tool-annotations.constant';
import { MCP_PROGRESS_NOTIFICATION_METHOD } from 'src/engine/api/mcp/constants/mcp-progress-notification.constant';
import { MCP_SERVER_INFO } from 'src/engine/api/mcp/constants/mcp-server-info.const';
import {
  McpException,
  McpExceptionCode,
} from 'src/engine/api/mcp/exceptions/mcp.exception';
import { McpInstructionBuilderService } from 'src/engine/api/mcp/services/mcp-instruction-builder.service';
import { McpToolExecutorService } from 'src/engine/api/mcp/services/mcp-tool-executor.service';
import { createGenericRecordTools } from 'src/engine/api/mcp/tools/generic-record-tools.tool';
import {
  createListObjectMetadataNamesTool,
  LIST_OBJECT_METADATA_NAMES_TOOL_NAME,
} from 'src/engine/api/mcp/tools/list-object-metadata-names.tool';
import {
  createListSkillsTool,
  LIST_SKILLS_TOOL_NAME,
} from 'src/engine/api/mcp/tools/list-skills.tool';
import { type McpAnnotatedTool } from 'src/engine/api/mcp/types/mcp-annotated-tool.type';
import { type McpCoreQueryContext } from 'src/engine/api/mcp/types/mcp-core-query-context.type';
import { type McpToolAnnotations } from 'src/engine/api/mcp/types/mcp-tool-annotations.type';
import { type McpToolSet } from 'src/engine/api/mcp/types/mcp-tool-set.type';
import { buildJsonRpcError } from 'src/engine/api/mcp/utils/build-json-rpc-error.util';
import { getMcpRegistryToolAnnotations } from 'src/engine/api/mcp/utils/get-mcp-registry-tool-annotations.util';
import { type FlatApiKey } from 'src/engine/core-modules/api-key/types/flat-api-key.type';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { COMMON_PRELOAD_TOOLS } from 'src/engine/core-modules/tool-provider/constants/common-preload-tools.const';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import {
  createLearnToolsTool,
  LEARN_TOOLS_TOOL_NAME,
} from 'src/engine/core-modules/tool-provider/tools';
import {
  createExecuteToolTool,
  EXECUTE_TOOL_TOOL_NAME,
} from 'src/engine/core-modules/tool-provider/tools/execute-tool.tool';
import {
  createGetToolCatalogTool,
  GET_TOOL_CATALOG_TOOL_NAME,
} from 'src/engine/core-modules/tool-provider/tools/get-tool-catalog.tool';
import {
  createLoadSkillTool,
  LOAD_SKILL_TOOL_NAME,
} from 'src/engine/core-modules/tool-provider/tools/load-skill.tool';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { SkillService } from 'src/engine/metadata-modules/skill/skill.service';
import { handleException } from 'src/engine/utils/global-exception-handler.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const MCP_PRELOADED_TOOL_ANNOTATIONS: Record<string, McpToolAnnotations> = {
  search_help_center: MCP_OPEN_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
};

const annotatePreloadedMcpTools = (toolSet: ToolSet): McpToolSet =>
  Object.fromEntries(
    Object.entries(toolSet).map(
      ([name, toolDefinition]): [string, McpAnnotatedTool] => {
        const annotations = MCP_PRELOADED_TOOL_ANNOTATIONS[name];

        if (!isDefined(annotations)) {
          throw new Error(
            `Missing MCP annotations for preloaded tool "${name}"`,
          );
        }

        return [name, { ...toolDefinition, annotations }];
      },
    ),
  );

@Injectable()
export class McpProtocolService {
  constructor(
    private readonly toolRegistry: ToolRegistryService,
    private readonly mcpToolExecutorService: McpToolExecutorService,
    private readonly skillService: SkillService,
    private readonly mcpInstructionBuilderService: McpInstructionBuilderService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  private async buildActorMetadata(
    workspaceId: string,
    userId?: string,
    apiKey?: FlatApiKey,
  ): Promise<ActorMetadata> {
    let actorMetadata: ActorMetadata = {
      source: FieldActorSource.AGENT,
      workspaceMemberId: null,
      name: 'Agent',
      context: {},
    };

    if (isDefined(apiKey)) {
      actorMetadata = {
        source: FieldActorSource.AGENT,
        workspaceMemberId: null,
        name: apiKey.name,
        context: {},
      };
    } else if (isDefined(userId)) {
      const { flatWorkspaceMemberMaps } =
        await this.workspaceCacheService.getOrRecompute(workspaceId, [
          'flatWorkspaceMemberMaps',
        ]);
      const workspaceMemberId = flatWorkspaceMemberMaps.idByUserId[userId];
      const workspaceMember = isDefined(workspaceMemberId)
        ? flatWorkspaceMemberMaps.byId[workspaceMemberId]
        : undefined;

      if (isDefined(workspaceMember)) {
        actorMetadata = {
          source: FieldActorSource.AGENT,
          workspaceMemberId: workspaceMember.id,
          name:
            `${workspaceMember.name?.firstName ?? ''} ${workspaceMember.name?.lastName ?? ''}`.trim() ||
            'Agent',
          context: {},
        };
      }
    }

    return actorMetadata;
  }

  private async buildMcpToolSet(
    workspace: FlatWorkspace,
    options?: {
      authContext?: WorkspaceAuthContext;
      userId?: string;
      userWorkspaceId?: string;
      apiKey?: FlatApiKey;
      application?: FlatApplication;
      agentId?: string;
    },
  ): Promise<{ toolSet: McpToolSet; toolContext: ToolProviderContext }> {
    const actorMetadata = await this.buildActorMetadata(
      workspace.id,
      options?.userId,
      options?.apiKey,
    );

    const toolContext: ToolProviderContext = {
      workspaceId: workspace.id,
      authContext: options?.authContext,
      application: options?.application,
      userId: options?.userId,
      userWorkspaceId: options?.userWorkspaceId,
      agentId: options?.agentId,
      actorMetadata,
    };

    const preloadedTools = await this.toolRegistry.getToolsByName(
      COMMON_PRELOAD_TOOLS,
      toolContext,
    );

    const toolSet: McpToolSet = {
      ...annotatePreloadedMcpTools(preloadedTools),
      [GET_TOOL_CATALOG_TOOL_NAME]: {
        ...createGetToolCatalogTool(this.toolRegistry, workspace.id, {
          userId: options?.userId,
          userWorkspaceId: options?.userWorkspaceId,
          excludeTools: MCP_EXCLUDED_TOOL_NAMES,
          authContext: options?.authContext,
          application: options?.application,
        }),
        annotations: MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
      },
      [EXECUTE_TOOL_TOOL_NAME]: {
        ...createExecuteToolTool(this.toolRegistry, toolContext, {
          isToolAllowed: (toolName) => !MCP_EXCLUDED_TOOL_NAMES.has(toolName),
        }),
        annotations: MCP_EXECUTE_TOOL_ANNOTATIONS,
      },
      [LOAD_SKILL_TOOL_NAME]: {
        ...createLoadSkillTool(
          (names) =>
            this.skillService.findFlatSkillsByNames(names, workspace.id),
          async () => {
            const allSkills = await this.skillService.findAllFlatSkills(
              workspace.id,
            );

            return allSkills.map((skill) => skill.name);
          },
        ),
        annotations: MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
      },
      [LIST_OBJECT_METADATA_NAMES_TOOL_NAME]: {
        ...createListObjectMetadataNamesTool(
          this.flatEntityMapsCacheService,
          workspace.id,
        ),
        annotations: MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
      },
      [LIST_SKILLS_TOOL_NAME]: {
        ...createListSkillsTool(this.skillService, workspace.id),
        annotations: MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
      },
      [LEARN_TOOLS_TOOL_NAME]: {
        ...createLearnToolsTool(this.toolRegistry, toolContext, {
          isToolAllowed: (toolName) => !MCP_EXCLUDED_TOOL_NAMES.has(toolName),
        }),
        annotations: MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
      },
    };

    return { toolSet, toolContext };
  }

  async handleRequest({
    request,
    parsedBody,
    method,
    context,
  }: {
    request: Request;
    parsedBody: unknown;
    method: string | undefined;
    context: McpCoreQueryContext;
  }): Promise<Response> {
    // The server is built from the caller's auth context, so each request gets its own handler
    const handler = createMcpHandler(() =>
      this.buildServer({ context, method }),
    );

    return handler.fetch(request, { parsedBody });
  }

  private async buildServer({
    context,
    method,
  }: {
    context: McpCoreQueryContext;
    method: string | undefined;
  }): Promise<Server> {
    const shouldBuildInstructions =
      isDefined(method) &&
      MCP_METHODS_RETURNING_INSTRUCTIONS.includes(method) &&
      context.authContext.type !== 'pendingActivationUser';

    const server = new Server(MCP_SERVER_INFO, {
      capabilities: MCP_SERVER_CAPABILITIES,
      cacheHints: MCP_RESULT_CACHE_HINTS,
      instructions: shouldBuildInstructions
        ? await this.buildInstructions(context)
        : undefined,
    });

    server.setRequestHandler('tools/list', () =>
      this.runToolRequest({
        context,
        handleToolRequest: () => this.handleToolsList(context),
      }),
    );
    server.setRequestHandler('tools/call', (request, serverContext) =>
      this.runToolRequest({
        context,
        handleToolRequest: () =>
          this.handleToolsCall({ request, serverContext, context }),
      }),
    );
    server.setRequestHandler('resources/list', async () => ({
      resources: [],
    }));
    server.setRequestHandler('prompts/list', async () => ({ prompts: [] }));

    return server;
  }

  private async runToolRequest<TResult>({
    context,
    handleToolRequest,
  }: {
    context: McpCoreQueryContext;
    handleToolRequest: () => Promise<TResult>;
  }): Promise<TResult> {
    try {
      // No tool runs without a workspace member, so a user still onboarding is refused upfront
      if (context.authContext.type === 'pendingActivationUser') {
        throw new McpException(
          'Finish signing up before using MCP',
          McpExceptionCode.FORBIDDEN,
        );
      }

      return await handleToolRequest();
    } catch (error) {
      const exception = this.reportException({ context, error });

      // The SDK would send any other error's message as is, internal details included
      const { code, message } = buildJsonRpcError(exception);

      throw new ProtocolError(code, message);
    }
  }

  // The SDK answers a failed server build with a generic error, so only reporting is needed here
  private async buildInstructions(
    context: McpCoreQueryContext,
  ): Promise<string> {
    try {
      return await this.mcpInstructionBuilderService.buildInstructions({
        workspaceId: context.workspace.id,
        authContext: context.authContext,
        toolMode: context.toolMode,
      });
    } catch (error) {
      throw this.reportException({ context, error });
    }
  }

  private reportException({
    context,
    error,
  }: {
    context: McpCoreQueryContext;
    error: unknown;
  }): Error {
    const exception = error instanceof Error ? error : new Error(String(error));

    handleException({
      exception,
      exceptionHandlerService: this.exceptionHandlerService,
      user: isDefined(context.userId) ? { id: context.userId } : undefined,
      workspace: { id: context.workspace.id },
    });

    return exception;
  }

  private async handleToolsList(
    context: McpCoreQueryContext,
  ): Promise<ListToolsResult> {
    const { toolSet, toolContext } = await this.resolveMcpToolSet(context);

    if (context.toolMode === 'meta') {
      return this.mcpToolExecutorService.handleToolsListing(toolSet);
    }

    // Directory reviews (ChatGPT) refuse a generic executor; still callable for clients that listed it
    const {
      [GET_TOOL_CATALOG_TOOL_NAME]: _getToolCatalogTool,
      [LEARN_TOOLS_TOOL_NAME]: _learnToolsTool,
      [EXECUTE_TOOL_TOOL_NAME]: _executeToolTool,
      ...nativeTools
    } = toolSet;

    switch (context.toolMode) {
      case 'direct':
        return this.mcpToolExecutorService.handleToolsListing({
          ...(await this.buildAnnotatedRegistryTools({ toolContext })),
          ...nativeTools,
        });
      case 'generic':
        return this.mcpToolExecutorService.handleToolsListing({
          ...(await this.buildAnnotatedRegistryTools({
            toolContext,
            categories: MCP_GENERIC_MODE_LISTED_TOOL_CATEGORIES,
          })),
          ...nativeTools,
        });
      default:
        return assertUnreachable(context.toolMode);
    }
  }

  private async handleToolsCall({
    request,
    serverContext,
    context,
  }: {
    request: CallToolRequest;
    serverContext: ServerContext;
    context: McpCoreQueryContext;
  }): Promise<CallToolResult> {
    const { name: toolName, arguments: toolArguments } = request.params;
    const progressToken = request.params._meta?.progressToken;

    const { toolSet } = await this.resolveMcpToolSet(context);

    // Also keeps per-object names working for clients that snapshotted an earlier tools/list
    const shouldForwardToExecuteTool =
      context.toolMode !== 'meta' && !isDefined(toolSet[toolName]);

    return this.mcpToolExecutorService.handleToolCall({
      toolSet,
      ...(shouldForwardToExecuteTool
        ? {
            toolName: EXECUTE_TOOL_TOOL_NAME,
            toolArguments: { toolName, arguments: toolArguments ?? {} },
          }
        : { toolName, toolArguments }),
      notifyToolCallStarted: isDefined(progressToken)
        ? () =>
            serverContext.mcpReq.notify({
              method: MCP_PROGRESS_NOTIFICATION_METHOD,
              params: { progressToken, progress: 0, total: 1 },
            })
        : undefined,
    });
  }

  private async resolveMcpToolSet(context: McpCoreQueryContext) {
    const { toolSet, toolContext } = await Sentry.startSpan(
      { name: 'mcp build tool set', op: 'mcp.tools', onlyIfParent: true },
      () =>
        this.buildMcpToolSet(context.workspace, {
          authContext: context.authContext,
          application: context.application,
          userId: context.userId,
          userWorkspaceId: context.userWorkspaceId,
          apiKey: context.apiKey,
          agentId: context.agentId,
        }),
    );

    if (context.toolMode !== 'generic') {
      return { toolSet, toolContext };
    }

    return {
      toolSet: {
        ...createGenericRecordTools({
          toolRegistry: this.toolRegistry,
          context: toolContext,
        }),
        ...toolSet,
      },
      toolContext,
    };
  }

  private buildAnnotatedRegistryTools({
    toolContext,
    categories,
  }: {
    toolContext: ToolProviderContext;
    categories?: ToolCategory[];
  }): Promise<McpToolSet> {
    return Sentry.startSpan(
      { name: 'mcp list registry tools', op: 'mcp.tools', onlyIfParent: true },
      async () => {
        const descriptors = await this.toolRegistry.getCatalog(toolContext, {
          excludeTools: MCP_EXCLUDED_TOOL_NAMES,
          includeSchemas: true,
          categories,
        });

        const registryTools = this.toolRegistry.hydrateToolSet(
          descriptors,
          toolContext,
        );

        return Object.fromEntries(
          descriptors.map((descriptor): [string, McpAnnotatedTool] => [
            descriptor.name,
            {
              ...registryTools[descriptor.name],
              title: descriptor.label,
              annotations: getMcpRegistryToolAnnotations(descriptor),
            },
          ]),
        );
      },
    );
  }
}
