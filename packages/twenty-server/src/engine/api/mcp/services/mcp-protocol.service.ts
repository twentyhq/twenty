import { Injectable } from '@nestjs/common';

import * as Sentry from '@sentry/node';
import { type ToolSet } from 'ai';
import { type ActorMetadata, FieldActorSource } from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS } from 'src/engine/api/mcp/constants/mcp-closed-world-read-only-tool-annotations.constant';
import { MCP_EXCLUDED_TOOL_NAMES } from 'src/engine/api/mcp/constants/mcp-excluded-tool-names.constant';
import { MCP_EXECUTE_TOOL_ANNOTATIONS } from 'src/engine/api/mcp/constants/mcp-execute-tool-annotations.const';
import { MCP_OPEN_WORLD_READ_ONLY_TOOL_ANNOTATIONS } from 'src/engine/api/mcp/constants/mcp-open-world-read-only-tool-annotations.constant';
import { MCP_PROTOCOL_VERSION } from 'src/engine/api/mcp/constants/mcp-protocol-version.const';
import { MCP_SERVER_INFO } from 'src/engine/api/mcp/constants/mcp-server-info.const';
import { JsonRpc } from 'src/engine/api/mcp/dtos/json-rpc';
import {
  McpException,
  McpExceptionCode,
} from 'src/engine/api/mcp/exceptions/mcp.exception';
import { McpInstructionBuilderService } from 'src/engine/api/mcp/services/mcp-instruction-builder.service';
import { McpToolExecutorService } from 'src/engine/api/mcp/services/mcp-tool-executor.service';
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
import { type McpInitializeResult } from 'src/engine/api/mcp/types/mcp-initialize-result.type';
import { type McpMethod } from 'src/engine/api/mcp/types/mcp-method.type';
import { type McpResult } from 'src/engine/api/mcp/types/mcp-result.type';
import { type McpToolAnnotations } from 'src/engine/api/mcp/types/mcp-tool-annotations.type';
import { type McpToolCallResult } from 'src/engine/api/mcp/types/mcp-tool-call-result.type';
import { type McpToolSet } from 'src/engine/api/mcp/types/mcp-tool-set.type';
import { type McpToolsListResult } from 'src/engine/api/mcp/types/mcp-tools-list-result.type';
import { buildJsonRpcError } from 'src/engine/api/mcp/utils/build-json-rpc-error.util';
import { getMcpRegistryToolAnnotations } from 'src/engine/api/mcp/utils/get-mcp-registry-tool-annotations.util';
import { isMcpMethod } from 'src/engine/api/mcp/utils/is-mcp-method.util';
import { parseMcpToolCallParams } from 'src/engine/api/mcp/utils/parse-mcp-tool-call-params.util';
import { wrapJsonRpcResponse } from 'src/engine/api/mcp/utils/wrap-jsonrpc-response.util';
import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/services/api-key-role.service';
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
import {
  type RoleIdsBySource,
  type RolePermissionConfig,
} from 'src/engine/twenty-orm/types/role-permission-config.type';
import { buildAgentRoleIdsBySource } from 'src/engine/twenty-orm/utils/build-agent-role-ids-by-source.util';
import { buildUserRoleIdsBySource } from 'src/engine/twenty-orm/utils/build-user-role-ids-by-source.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { SkillService } from 'src/engine/metadata-modules/skill/skill.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
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
    private readonly userRoleService: UserRoleService,
    private readonly mcpToolExecutorService: McpToolExecutorService,
    private readonly apiKeyRoleService: ApiKeyRoleService,
    private readonly skillService: SkillService,
    private readonly mcpInstructionBuilderService: McpInstructionBuilderService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  private async handleInitialize(
    context: McpCoreQueryContext,
  ): Promise<McpInitializeResult> {
    const { rolePermissionConfig } = await this.resolveCallerRoles({
      workspaceId: context.workspace.id,
      userWorkspaceId: context.userWorkspaceId,
      apiKey: context.apiKey,
      application: context.application,
      agentId: context.agentId,
    });

    const instructions =
      await this.mcpInstructionBuilderService.buildInstructions({
        workspaceId: context.workspace.id,
        rolePermissionConfig,
        isDirectMode: context.isDirectMode,
      });

    return {
      protocolVersion: MCP_PROTOCOL_VERSION,
      capabilities: {
        tools: { listChanged: false },
        resources: { listChanged: false },
        prompts: { listChanged: false },
      },
      serverInfo: MCP_SERVER_INFO,
      instructions,
    };
  }

  async resolveCallerRoles({
    workspaceId,
    userWorkspaceId,
    apiKey,
    application,
    agentId,
  }: {
    workspaceId: string;
    userWorkspaceId?: string;
    apiKey?: FlatApiKey;
    application?: FlatApplication;
    agentId?: string;
  }): Promise<{ rolePermissionConfig: RolePermissionConfig }> {
    if (isDefined(apiKey)) {
      const apiKeyRoleId = await this.apiKeyRoleService.getRoleIdForApiKeyId(
        apiKey.id,
        workspaceId,
      );

      return {
        rolePermissionConfig: { intersectionOf: { apiKeyRoleId } },
      };
    }

    const agentRoleIdsBySource = await this.resolveAgentRoleIdsBySource({
      workspaceId,
      agentId,
    });

    if (!userWorkspaceId && isDefined(application)) {
      if (!isDefined(application.defaultRoleId)) {
        throw new McpException(
          'Application has no role',
          McpExceptionCode.FORBIDDEN,
        );
      }

      return {
        rolePermissionConfig: {
          intersectionOf: {
            applicationRoleId: application.defaultRoleId,
            ...agentRoleIdsBySource,
          },
        },
      };
    }

    if (!userWorkspaceId) {
      throw new McpException(
        'User workspace ID missing',
        McpExceptionCode.FORBIDDEN,
      );
    }

    const userRoleId = await this.userRoleService.getRoleIdForUserWorkspace({
      workspaceId,
      userWorkspaceId,
    });

    return {
      rolePermissionConfig: {
        intersectionOf: {
          ...buildUserRoleIdsBySource({ userRoleId, application }),
          ...agentRoleIdsBySource,
        },
      },
    };
  }

  private async resolveAgentRoleIdsBySource({
    workspaceId,
    agentId,
  }: {
    workspaceId: string;
    agentId: string | undefined;
  }): Promise<Pick<RoleIdsBySource, 'agentRoleId'>> {
    if (!isDefined(agentId)) {
      return {};
    }

    const { flatRoleTargetByAgentIdMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatRoleTargetByAgentIdMaps',
      ]);

    return buildAgentRoleIdsBySource({ agentId, flatRoleTargetByAgentIdMaps });
  }

  private async buildActorContext(
    workspaceId: string,
    userId?: string,
    apiKey?: FlatApiKey,
  ): Promise<ActorMetadata> {
    let actorContext: ActorMetadata = {
      source: FieldActorSource.AGENT,
      workspaceMemberId: null,
      name: 'Agent',
      context: {},
    };

    if (isDefined(apiKey)) {
      actorContext = {
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
        actorContext = {
          source: FieldActorSource.AGENT,
          workspaceMemberId: workspaceMember.id,
          name:
            `${workspaceMember.name?.firstName ?? ''} ${workspaceMember.name?.lastName ?? ''}`.trim() ||
            'Agent',
          context: {},
        };
      }
    }

    return actorContext;
  }

  private async buildMcpToolSet(
    workspace: FlatWorkspace,
    rolePermissionConfig: RolePermissionConfig,
    options?: {
      authContext?: WorkspaceAuthContext;
      userId?: string;
      userWorkspaceId?: string;
      apiKey?: FlatApiKey;
      application?: FlatApplication;
      agentId?: string;
    },
  ): Promise<{ toolSet: McpToolSet; toolContext: ToolProviderContext }> {
    const actorContext = await this.buildActorContext(
      workspace.id,
      options?.userId,
      options?.apiKey,
    );

    const toolContext: ToolProviderContext = {
      workspaceId: workspace.id,
      rolePermissionConfig,
      authContext: options?.authContext,
      application: options?.application,
      userId: options?.userId,
      userWorkspaceId: options?.userWorkspaceId,
      agentId: options?.agentId,
      actorContext,
    };

    const preloadedTools = await this.toolRegistry.getToolsByName(
      COMMON_PRELOAD_TOOLS,
      toolContext,
    );

    const toolSet: McpToolSet = {
      ...annotatePreloadedMcpTools(preloadedTools),
      [GET_TOOL_CATALOG_TOOL_NAME]: {
        ...createGetToolCatalogTool(this.toolRegistry, workspace.id, {
          rolePermissionConfig,
          userId: options?.userId,
          userWorkspaceId: options?.userWorkspaceId,
          excludeTools: MCP_EXCLUDED_TOOL_NAMES,
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

  // Returns null for JSON-RPC notifications (no id), which require no response body
  async handleMCPCoreQuery(
    { id, method, params }: JsonRpc,
    context: McpCoreQueryContext,
    sseWriter?: (data: Record<string, unknown>) => void,
  ): Promise<Record<string, unknown> | null> {
    // JSON-RPC notifications have no id and expect no response
    if (!isDefined(id)) {
      return null;
    }

    try {
      // No tool runs without a workspace member, so a user still onboarding is refused upfront
      if (context.authContext.type === 'pendingActivationUser') {
        throw new McpException(
          'Finish signing up before using MCP',
          McpExceptionCode.FORBIDDEN,
        );
      }

      if (!isMcpMethod(method)) {
        throw new McpException(
          `Method '${method}' not found`,
          McpExceptionCode.METHOD_NOT_FOUND,
        );
      }

      const result = await this.dispatchMcpMethod({
        method,
        params,
        context,
        sseWriter,
      });

      return wrapJsonRpcResponse(id, { result });
    } catch (error) {
      const exception =
        error instanceof Error ? error : new Error(String(error));

      handleException({
        exception,
        exceptionHandlerService: this.exceptionHandlerService,
        user: isDefined(context.userId) ? { id: context.userId } : undefined,
        workspace: { id: context.workspace.id },
      });

      return wrapJsonRpcResponse(id, { error: buildJsonRpcError(exception) });
    }
  }

  private async dispatchMcpMethod({
    method,
    params,
    context,
    sseWriter,
  }: {
    method: McpMethod;
    params: Record<string, unknown> | undefined;
    context: McpCoreQueryContext;
    sseWriter?: (data: Record<string, unknown>) => void;
  }): Promise<McpResult> {
    switch (method) {
      case 'initialize':
        return this.handleInitialize(context);
      case 'ping':
        return {};
      case 'prompts/list':
        return { prompts: [] };
      case 'resources/list':
        return { resources: [] };
      case 'tools/list':
        return this.handleToolsList(context);
      case 'tools/call':
        return this.handleToolsCall({ params, context, sseWriter });
      default:
        return assertUnreachable(method);
    }
  }

  private async handleToolsList(
    context: McpCoreQueryContext,
  ): Promise<McpToolsListResult> {
    const { toolSet, toolContext } = await this.resolveMcpToolSet(context);

    if (!context.isDirectMode) {
      return this.mcpToolExecutorService.handleToolsListing(toolSet);
    }

    const {
      [GET_TOOL_CATALOG_TOOL_NAME]: _getToolCatalogTool,
      [LEARN_TOOLS_TOOL_NAME]: _learnToolsTool,
      [EXECUTE_TOOL_TOOL_NAME]: _executeToolTool,
      ...nativeTools
    } = toolSet;

    const annotatedRegistryTools =
      await this.buildAnnotatedRegistryTools(toolContext);

    return this.mcpToolExecutorService.handleToolsListing({
      ...annotatedRegistryTools,
      ...nativeTools,
    });
  }

  private async handleToolsCall({
    params,
    context,
    sseWriter,
  }: {
    params: Record<string, unknown> | undefined;
    context: McpCoreQueryContext;
    sseWriter?: (data: Record<string, unknown>) => void;
  }): Promise<McpToolCallResult> {
    const toolCallParams = parseMcpToolCallParams(params);

    if (!isDefined(toolCallParams)) {
      throw new McpException(
        'tools/call requires params with name and arguments',
        McpExceptionCode.INVALID_PARAMS,
      );
    }

    const { toolName, toolArguments, progressToken } = toolCallParams;

    const { toolSet } = await this.resolveMcpToolSet(context);

    const shouldForwardToExecuteTool =
      context.isDirectMode && !isDefined(toolSet[toolName]);

    return this.mcpToolExecutorService.handleToolCall({
      toolSet,
      ...(shouldForwardToExecuteTool
        ? {
            toolName: EXECUTE_TOOL_TOOL_NAME,
            toolArguments: { toolName, arguments: toolArguments ?? {} },
          }
        : { toolName, toolArguments }),
      progressToken,
      sseWriter,
    });
  }

  private async resolveMcpToolSet(context: McpCoreQueryContext) {
    const { rolePermissionConfig } = await this.resolveCallerRoles({
      workspaceId: context.workspace.id,
      userWorkspaceId: context.userWorkspaceId,
      apiKey: context.apiKey,
      application: context.application,
      agentId: context.agentId,
    });

    return Sentry.startSpan(
      { name: 'mcp build tool set', op: 'mcp.tools', onlyIfParent: true },
      () =>
        this.buildMcpToolSet(context.workspace, rolePermissionConfig, {
          authContext: context.authContext,
          application: context.application,
          userId: context.userId,
          userWorkspaceId: context.userWorkspaceId,
          apiKey: context.apiKey,
          agentId: context.agentId,
        }),
    );
  }

  private buildAnnotatedRegistryTools(
    toolContext: ToolProviderContext,
  ): Promise<McpToolSet> {
    return Sentry.startSpan(
      { name: 'mcp list registry tools', op: 'mcp.tools', onlyIfParent: true },
      async () => {
        const descriptors = await this.toolRegistry.getDescriptorsByCategories(
          toolContext,
          { excludeTools: [...MCP_EXCLUDED_TOOL_NAMES] },
        );

        const registryTools = this.toolRegistry.hydrateToolSet(
          descriptors,
          toolContext,
        );

        return Object.fromEntries(
          descriptors.map((descriptor): [string, McpAnnotatedTool] => [
            descriptor.name,
            {
              ...registryTools[descriptor.name],
              annotations: getMcpRegistryToolAnnotations(
                descriptor.executionRef,
              ),
            },
          ]),
        );
      },
    );
  }
}
