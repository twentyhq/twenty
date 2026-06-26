import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { JSON_RPC_ERROR_CODE } from 'src/engine/api/mcp/constants/json-rpc-error-code.const';
import { MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS } from 'src/engine/api/mcp/constants/mcp-closed-world-read-only-tool-annotations.const';
import { MCP_EXECUTE_TOOL_ANNOTATIONS } from 'src/engine/api/mcp/constants/mcp-execute-tool-annotations.const';
import { MCP_OPEN_WORLD_READ_ONLY_TOOL_ANNOTATIONS } from 'src/engine/api/mcp/constants/mcp-open-world-read-only-tool-annotations.const';
import { MCP_PROTOCOL_VERSION } from 'src/engine/api/mcp/constants/mcp-protocol-version.const';
import { MCP_SERVER_INFO } from 'src/engine/api/mcp/constants/mcp-server-info.const';
import { type JsonRpc } from 'src/engine/api/mcp/dtos/json-rpc';
import { McpInstructionBuilderService } from 'src/engine/api/mcp/services/mcp-instruction-builder.service';
import { McpProtocolService } from 'src/engine/api/mcp/services/mcp-protocol.service';
import { McpToolExecutorService } from 'src/engine/api/mcp/services/mcp-tool-executor.service';
import { LIST_OBJECT_METADATA_NAMES_TOOL_NAME } from 'src/engine/api/mcp/tools/list-object-metadata-names.tool';
import { LIST_SKILLS_TOOL_NAME } from 'src/engine/api/mcp/tools/list-skills.tool';
import { type McpToolAnnotations } from 'src/engine/api/mcp/types/mcp-tool-annotations.type';
import { type FlatApiKey } from 'src/engine/core-modules/api-key/types/flat-api-key.type';
import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/services/api-key-role.service';
import { EXECUTE_TOOL_TOOL_NAME } from 'src/engine/core-modules/tool-provider/tools/execute-tool.tool';
import { LEARN_TOOLS_TOOL_NAME } from 'src/engine/core-modules/tool-provider/tools/learn-tools.tool';
import { LOAD_SKILL_TOOL_NAME } from 'src/engine/core-modules/tool-provider/tools/load-skill.tool';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { SkillService } from 'src/engine/metadata-modules/skill/skill.service';
import { FieldActorSource } from 'twenty-shared/types';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';

describe('McpProtocolService', () => {
  let service: McpProtocolService;
  let _toolRegistryService: jest.Mocked<ToolRegistryService>;
  let userRoleService: jest.Mocked<UserRoleService>;
  let mcpToolExecutorService: jest.Mocked<McpToolExecutorService>;
  let apiKeyRoleService: jest.Mocked<ApiKeyRoleService>;

  const mockWorkspace = { id: 'workspace-1' } as FlatWorkspace;
  const mockUserWorkspaceId = 'user-workspace-1';
  const mockRoleId = 'role-1';
  const mockAdminRoleId = 'admin-role-1';
  const mockApiKey = {
    id: 'api-key-1',
    workspaceId: mockWorkspace.id,
  } as FlatApiKey;

  const EXPECTED_MCP_TOOL_NAMES = [
    LEARN_TOOLS_TOOL_NAME,
    EXECUTE_TOOL_TOOL_NAME,
    LOAD_SKILL_TOOL_NAME,
    LIST_OBJECT_METADATA_NAMES_TOOL_NAME,
    LIST_SKILLS_TOOL_NAME,
    'search_help_center',
  ] as const;

  const EXPECTED_MCP_TOOL_ANNOTATIONS: Record<
    (typeof EXPECTED_MCP_TOOL_NAMES)[number],
    McpToolAnnotations
  > = {
    [LEARN_TOOLS_TOOL_NAME]: MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
    [EXECUTE_TOOL_TOOL_NAME]: MCP_EXECUTE_TOOL_ANNOTATIONS,
    [LOAD_SKILL_TOOL_NAME]: MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
    [LIST_OBJECT_METADATA_NAMES_TOOL_NAME]:
      MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
    [LIST_SKILLS_TOOL_NAME]: MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
    search_help_center: MCP_OPEN_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
  };

  beforeEach(async () => {
    const mockSearchHelpCenterTool = {
      description: 'Search help center',
      inputSchema: { jsonSchema: { type: 'object' } },
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        McpProtocolService,
        {
          provide: ToolRegistryService,
          useValue: {
            buildToolIndex: jest.fn().mockResolvedValue([]),
            getToolsByName: jest.fn().mockResolvedValue({
              search_help_center: mockSearchHelpCenterTool,
            }),
            getToolInfo: jest.fn().mockResolvedValue([]),
            resolveAndExecute: jest.fn(),
          },
        },
        {
          provide: UserRoleService,
          useValue: { getRoleIdForUserWorkspace: jest.fn() },
        },
        {
          provide: McpToolExecutorService,
          useValue: {
            handleToolCall: jest.fn(),
            handleToolsListing: jest.fn(),
          },
        },
        {
          provide: ApiKeyRoleService,
          useValue: {
            getRoleIdForApiKeyId: jest.fn().mockResolvedValue(mockAdminRoleId),
          },
        },
        {
          provide: SkillService,
          useValue: {
            findFlatSkillsByNames: jest.fn().mockResolvedValue([]),
            findAllFlatSkills: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: McpInstructionBuilderService,
          useValue: {
            buildInstructions: jest.fn().mockResolvedValue('mock instructions'),
          },
        },
        {
          provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
          useValue: {
            getOrRecomputeManyOrAllFlatEntityMaps: jest.fn().mockResolvedValue({
              flatObjectMetadataMaps: { byUniversalIdentifier: {} },
            }),
          },
        },
        {
          provide: WorkspaceCacheService,
          useValue: {
            getOrRecompute: jest.fn().mockResolvedValue({
              flatWorkspaceMemberMaps: {
                idByUserId: {},
                byId: {},
              },
            }),
          },
        },
      ],
    }).compile();

    service = module.get<McpProtocolService>(McpProtocolService);
    _toolRegistryService = module.get(ToolRegistryService);
    userRoleService = module.get(UserRoleService);
    mcpToolExecutorService = module.get(McpToolExecutorService);
    apiKeyRoleService = module.get(ApiKeyRoleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleInitialize', () => {
    it('should return spec-compliant initialization response', async () => {
      const requestId = '123';
      const result = await service.handleInitialize(
        requestId,
        mockWorkspace.id,
      );

      expect(result).toEqual({
        id: requestId,
        jsonrpc: '2.0',
        result: {
          protocolVersion: MCP_PROTOCOL_VERSION,
          capabilities: {
            tools: { listChanged: false },
            resources: { listChanged: false },
            prompts: { listChanged: false },
          },
          serverInfo: MCP_SERVER_INFO,
          instructions: expect.any(String),
        },
      });
    });
  });

  describe('getRoleId', () => {
    it('should return role ID when available', async () => {
      userRoleService.getRoleIdForUserWorkspace.mockResolvedValue(mockRoleId);

      const result = await service.getRoleId('workspace-1', 'user-workspace-1');

      expect(result).toBe(mockRoleId);
      expect(userRoleService.getRoleIdForUserWorkspace).toHaveBeenCalledWith({
        workspaceId: 'workspace-1',
        userWorkspaceId: 'user-workspace-1',
      });
    });

    it('should throw when userWorkspaceId is missing and no apiKey is provided', async () => {
      await expect(service.getRoleId('workspace-1', undefined)).rejects.toThrow(
        new HttpException('User workspace ID missing', HttpStatus.FORBIDDEN),
      );
    });

    it('should throw when role ID is missing', async () => {
      userRoleService.getRoleIdForUserWorkspace.mockResolvedValue(
        undefined as unknown as string,
      );

      await expect(
        service.getRoleId('workspace-1', 'user-workspace-1'),
      ).rejects.toThrow(
        new HttpException('Role ID missing', HttpStatus.FORBIDDEN),
      );
    });

    it('should return role ID from ApiKeyRoleService when apiKey is provided', async () => {
      const result = await service.getRoleId(
        'workspace-1',
        undefined,
        mockApiKey,
      );

      expect(result).toBe(mockAdminRoleId);
      expect(apiKeyRoleService.getRoleIdForApiKeyId).toHaveBeenCalledWith(
        mockApiKey.id,
        'workspace-1',
      );
    });
  });

  describe('handleMCPCoreQuery', () => {
    it('should handle initialize method', async () => {
      const mockRequest: JsonRpc = {
        jsonrpc: '2.0',
        method: 'initialize',
        id: '123',
      };

      const result = await service.handleMCPCoreQuery(mockRequest, {
        workspace: mockWorkspace,
        userWorkspaceId: mockUserWorkspaceId,
        apiKey: undefined,
      });

      expect(result).toEqual({
        id: '123',
        jsonrpc: '2.0',
        result: {
          protocolVersion: MCP_PROTOCOL_VERSION,
          capabilities: {
            tools: { listChanged: false },
            resources: { listChanged: false },
            prompts: { listChanged: false },
          },
          serverInfo: MCP_SERVER_INFO,
          instructions: expect.any(String),
        },
      });
    });

    it('should return null for notifications (no id)', async () => {
      const mockRequest: JsonRpc = {
        jsonrpc: '2.0',
        method: 'notifications/initialized',
      };

      const result = await service.handleMCPCoreQuery(mockRequest, {
        workspace: mockWorkspace,
        userWorkspaceId: mockUserWorkspaceId,
        apiKey: undefined,
      });

      expect(result).toBeNull();
    });

    it('should build a ToolSet with exactly 6 tools and pass it to executor for tools/call', async () => {
      userRoleService.getRoleIdForUserWorkspace.mockResolvedValue(mockRoleId);

      const mockToolCallResponse = {
        id: '123',
        jsonrpc: '2.0',
        result: {
          content: [{ type: 'text', text: '{}' }],
          isError: false,
        },
      };

      mcpToolExecutorService.handleToolCall.mockResolvedValue(
        mockToolCallResponse,
      );

      const mockRequest: JsonRpc = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'execute_tool',
          arguments: { toolName: 'find_many_companies', arguments: {} },
        },
        id: '123',
      };

      await service.handleMCPCoreQuery(mockRequest, {
        workspace: mockWorkspace,
        userWorkspaceId: mockUserWorkspaceId,
        apiKey: undefined,
      });

      expect(mcpToolExecutorService.handleToolCall).toHaveBeenCalledWith(
        '123',
        expect.objectContaining(
          Object.fromEntries(
            EXPECTED_MCP_TOOL_NAMES.map((name) => [
              name,
              expect.objectContaining({
                description: expect.any(String),
                annotations: EXPECTED_MCP_TOOL_ANNOTATIONS[name],
                execute: expect.any(Function),
              }),
            ]),
          ),
        ),
        mockRequest.params,
        undefined,
      );
    });

    it('should build a ToolSet with exactly 6 tools and pass it to executor for tools/list', async () => {
      userRoleService.getRoleIdForUserWorkspace.mockResolvedValue(mockRoleId);

      mcpToolExecutorService.handleToolsListing.mockReturnValue({
        id: '123',
        jsonrpc: '2.0',
        result: { tools: [] },
      });

      const mockRequest: JsonRpc = {
        jsonrpc: '2.0',
        method: 'tools/list',
        id: '123',
      };

      await service.handleMCPCoreQuery(mockRequest, {
        workspace: mockWorkspace,
        userWorkspaceId: mockUserWorkspaceId,
        apiKey: undefined,
      });

      expect(mcpToolExecutorService.handleToolsListing).toHaveBeenCalledWith(
        '123',
        expect.objectContaining(
          Object.fromEntries(
            EXPECTED_MCP_TOOL_NAMES.map((name) => [
              name,
              expect.objectContaining({
                description: expect.any(String),
                annotations: EXPECTED_MCP_TOOL_ANNOTATIONS[name],
              }),
            ]),
          ),
        ),
      );
    });

    it('should pass actorContext with FieldActorSource.AGENT to getToolsByName', async () => {
      userRoleService.getRoleIdForUserWorkspace.mockResolvedValue(mockRoleId);

      const mockRequest: JsonRpc = {
        jsonrpc: '2.0',
        method: 'tools/list',
        id: '123',
      };

      await service.handleMCPCoreQuery(mockRequest, {
        workspace: mockWorkspace,
        userWorkspaceId: mockUserWorkspaceId,
        apiKey: undefined,
      });

      expect(_toolRegistryService.getToolsByName).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          actorContext: expect.objectContaining({
            source: FieldActorSource.AGENT,
          }),
        }),
      );
    });

    it('should return prompts list without role resolution', async () => {
      const mockRequest: JsonRpc = {
        jsonrpc: '2.0',
        method: 'prompts/list',
        id: '123',
      };

      const result = await service.handleMCPCoreQuery(mockRequest, {
        workspace: mockWorkspace,
        userWorkspaceId: mockUserWorkspaceId,
        apiKey: undefined,
      });

      expect(result).toEqual({
        id: '123',
        jsonrpc: '2.0',
        result: { prompts: [] },
      });
      expect(userRoleService.getRoleIdForUserWorkspace).not.toHaveBeenCalled();
    });

    it('should return resources list without role resolution', async () => {
      const mockRequest: JsonRpc = {
        jsonrpc: '2.0',
        method: 'resources/list',
        id: '123',
      };

      const result = await service.handleMCPCoreQuery(mockRequest, {
        workspace: mockWorkspace,
        userWorkspaceId: mockUserWorkspaceId,
        apiKey: undefined,
      });

      expect(result).toEqual({
        id: '123',
        jsonrpc: '2.0',
        result: { resources: [] },
      });
      expect(userRoleService.getRoleIdForUserWorkspace).not.toHaveBeenCalled();
    });

    it('should return method not found for unknown methods', async () => {
      const mockRequest: JsonRpc = {
        jsonrpc: '2.0',
        method: 'unknown/method',
        id: '123',
      };

      const result = await service.handleMCPCoreQuery(mockRequest, {
        workspace: mockWorkspace,
        userWorkspaceId: mockUserWorkspaceId,
        apiKey: undefined,
      });

      expect(result).toEqual({
        id: '123',
        jsonrpc: '2.0',
        error: {
          code: JSON_RPC_ERROR_CODE.METHOD_NOT_FOUND,
          message: "Method 'unknown/method' not found",
        },
      });
    });

    it('should handle tools/call with apiKey authentication', async () => {
      const mockToolCallResponse = {
        id: '123',
        jsonrpc: '2.0',
        result: { content: [{ type: 'text', text: '{}' }], isError: false },
      };

      mcpToolExecutorService.handleToolCall.mockResolvedValue(
        mockToolCallResponse,
      );

      const mockRequest: JsonRpc = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'execute_tool', arguments: {} },
        id: '123',
      };

      const result = await service.handleMCPCoreQuery(mockRequest, {
        workspace: mockWorkspace,
        apiKey: mockApiKey,
      });

      expect(result).toEqual(mockToolCallResponse);
      expect(apiKeyRoleService.getRoleIdForApiKeyId).toHaveBeenCalledWith(
        mockApiKey.id,
        mockWorkspace.id,
      );
    });

    it('should wrap unexpected errors with INTERNAL_ERROR code', async () => {
      userRoleService.getRoleIdForUserWorkspace.mockResolvedValue(mockRoleId);

      mcpToolExecutorService.handleToolCall.mockRejectedValue(
        new Error('Something went wrong'),
      );

      const mockRequest: JsonRpc = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'execute_tool', arguments: {} },
        id: '123',
      };

      const result = await service.handleMCPCoreQuery(mockRequest, {
        workspace: mockWorkspace,
        userWorkspaceId: mockUserWorkspaceId,
        apiKey: undefined,
      });

      expect(result).toEqual({
        id: '123',
        jsonrpc: '2.0',
        error: {
          code: JSON_RPC_ERROR_CODE.INTERNAL_ERROR,
          message: 'Something went wrong',
        },
      });
    });

    it('should wrap HttpException errors with SERVER_ERROR code', async () => {
      userRoleService.getRoleIdForUserWorkspace.mockRejectedValue(
        new HttpException('Role ID missing', HttpStatus.FORBIDDEN),
      );

      const mockRequest: JsonRpc = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'execute_tool', arguments: {} },
        id: '123',
      };

      const result = await service.handleMCPCoreQuery(mockRequest, {
        workspace: mockWorkspace,
        userWorkspaceId: mockUserWorkspaceId,
        apiKey: undefined,
      });

      expect(result).toEqual({
        id: '123',
        jsonrpc: '2.0',
        error: {
          code: JSON_RPC_ERROR_CODE.SERVER_ERROR,
          message: 'Role ID missing',
        },
      });
    });
  });
});
