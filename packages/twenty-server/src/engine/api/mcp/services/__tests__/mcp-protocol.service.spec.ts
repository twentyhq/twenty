import { HttpException, HttpStatus } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { jsonSchema } from 'ai';

import { MCP_SERVER_METADATA } from 'src/engine/api/mcp/constants/mcp.const';
import { type JsonRpc } from 'src/engine/api/mcp/dtos/json-rpc';
import { McpProtocolService } from 'src/engine/api/mcp/services/mcp-protocol.service';
import { McpToolExecutorService } from 'src/engine/api/mcp/services/mcp-tool-executor.service';
import { type ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/services/api-key-role.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';

describe('McpProtocolService', () => {
  let service: McpProtocolService;
  let featureFlagService: jest.Mocked<FeatureFlagService>;
  let toolRegistryService: jest.Mocked<ToolRegistryService>;
  let userRoleService: jest.Mocked<UserRoleService>;
  let mcpToolExecutorService: jest.Mocked<McpToolExecutorService>;
  let apiKeyRoleService: jest.Mocked<ApiKeyRoleService>;

  const mockWorkspace = { id: 'workspace-1' } as WorkspaceEntity;
  const mockUserWorkspaceId = 'user-workspace-1';
  const mockRoleId = 'role-1';
  const mockAdminRoleId = 'admin-role-1';
  const mockApiKey = {
    id: 'api-key-1',
    workspaceId: mockWorkspace.id,
  } as ApiKeyEntity;

  beforeEach(async () => {
    const mockFeatureFlagService = {
      isFeatureEnabled: jest.fn(),
    };

    const mockToolRegistryService = {
      getToolsByCategories: jest.fn(),
    };

    const mockUserRoleService = {
      getRoleIdForUserWorkspace: jest.fn(),
    };

    const mockMcpToolExecutorService = {
      handleToolCall: jest.fn(),
      handleToolsListing: jest.fn(),
    };

    const mockApiKeyRoleService = {
      getRoleIdForApiKeyId: jest.fn().mockResolvedValue(mockAdminRoleId),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        McpProtocolService,
        {
          provide: FeatureFlagService,
          useValue: mockFeatureFlagService,
        },
        {
          provide: ToolRegistryService,
          useValue: mockToolRegistryService,
        },
        {
          provide: UserRoleService,
          useValue: mockUserRoleService,
        },
        {
          provide: McpToolExecutorService,
          useValue: mockMcpToolExecutorService,
        },
        {
          provide: ApiKeyRoleService,
          useValue: mockApiKeyRoleService,
        },
      ],
    }).compile();

    service = module.get<McpProtocolService>(McpProtocolService);
    featureFlagService = module.get(FeatureFlagService);
    toolRegistryService = module.get(ToolRegistryService);
    userRoleService = module.get(UserRoleService);
    mcpToolExecutorService = module.get(McpToolExecutorService);
    apiKeyRoleService = module.get(ApiKeyRoleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkAiEnabled', () => {
    it('should not throw when AI is enabled', async () => {
      featureFlagService.isFeatureEnabled.mockResolvedValue(true);

      await expect(
        service.checkAiEnabled('workspace-1'),
      ).resolves.not.toThrow();
      expect(featureFlagService.isFeatureEnabled).toHaveBeenCalledWith(
        FeatureFlagKey.IS_AI_ENABLED,
        'workspace-1',
      );
    });

    it('should throw when AI is disabled', async () => {
      featureFlagService.isFeatureEnabled.mockResolvedValue(false);

      await expect(service.checkAiEnabled('workspace-1')).rejects.toThrow(
        new HttpException(
          'AI feature is not enabled for this workspace',
          HttpStatus.FORBIDDEN,
        ),
      );
    });
  });

  describe('handleInitialize', () => {
    it('should return correct initialization response', () => {
      const requestId = '123';
      const result = service.handleInitialize(requestId);

      expect(result).toMatchObject({
        id: requestId,
        jsonrpc: '2.0',
        result: expect.objectContaining({
          ...MCP_SERVER_METADATA,
          capabilities: {
            tools: { listChanged: false },
            resources: { listChanged: false },
            prompts: { listChanged: false },
          },
        }),
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
      featureFlagService.isFeatureEnabled.mockResolvedValue(true);

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

      expect(result).toMatchObject({
        id: '123',
        jsonrpc: '2.0',
        result: expect.objectContaining({
          ...MCP_SERVER_METADATA,
          capabilities: {
            tools: { listChanged: false },
            resources: { listChanged: false },
            prompts: { listChanged: false },
          },
        }),
      });
    });

    it('should handle tools/call method with userWorkspaceId', async () => {
      featureFlagService.isFeatureEnabled.mockResolvedValue(true);
      userRoleService.getRoleIdForUserWorkspace.mockResolvedValue(mockRoleId);

      const mockTool = {
        description: 'Test tool',
        inputSchema: jsonSchema({ type: 'object', properties: {} }),
        execute: jest.fn().mockResolvedValue({ result: 'success' }),
      };

      const mockToolsMap = {
        testTool: mockTool,
      };

      toolRegistryService.getToolsByCategories.mockResolvedValue(mockToolsMap);

      const mockToolCallResponse = {
        id: '123',
        jsonrpc: '2.0',
        result: {
          ...MCP_SERVER_METADATA,
          content: [
            {
              type: 'text',
              text: JSON.stringify({ result: 'success' }),
            },
          ],
          isError: false,
        },
      };

      mcpToolExecutorService.handleToolCall.mockResolvedValue(
        mockToolCallResponse,
      );

      const mockRequest: JsonRpc = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'testTool', arguments: { arg1: 'value1' } },
        id: '123',
      };

      const result = await service.handleMCPCoreQuery(mockRequest, {
        workspace: mockWorkspace,
        userWorkspaceId: mockUserWorkspaceId,
        apiKey: undefined,
      });

      expect(result).toEqual(mockToolCallResponse);
      expect(mcpToolExecutorService.handleToolCall).toHaveBeenCalledWith(
        '123',
        mockToolsMap,
        { name: 'testTool', arguments: { arg1: 'value1' } },
      );
    });

    it('should handle tools/call method with apiKey', async () => {
      featureFlagService.isFeatureEnabled.mockResolvedValue(true);

      const mockTool = {
        description: 'Test tool',
        inputSchema: jsonSchema({ type: 'object', properties: {} }),
        execute: jest.fn().mockResolvedValue({ result: 'success' }),
      };

      const mockToolsMap = {
        testTool: mockTool,
      };

      toolRegistryService.getToolsByCategories.mockResolvedValue(mockToolsMap);

      const mockToolCallResponse = {
        id: '123',
        jsonrpc: '2.0',
        result: {
          ...MCP_SERVER_METADATA,
          content: [
            {
              type: 'text',
              text: JSON.stringify({ result: 'success' }),
            },
          ],
          isError: false,
        },
      };

      mcpToolExecutorService.handleToolCall.mockResolvedValue(
        mockToolCallResponse,
      );

      const mockRequest: JsonRpc = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'testTool', arguments: { arg1: 'value1' } },
        id: '123',
      };

      const result = await service.handleMCPCoreQuery(mockRequest, {
        workspace: mockWorkspace,
        apiKey: mockApiKey,
      });

      expect(result).toEqual(mockToolCallResponse);
      expect(toolRegistryService.getToolsByCategories).toHaveBeenCalled();
    });

    it('should handle tools listing', async () => {
      featureFlagService.isFeatureEnabled.mockResolvedValue(true);
      userRoleService.getRoleIdForUserWorkspace.mockResolvedValue(mockRoleId);

      const mockToolsMap = {
        testTool: {
          description: 'Test tool',
          inputSchema: jsonSchema({ type: 'object', properties: {} }),
        },
      };

      toolRegistryService.getToolsByCategories.mockResolvedValue(mockToolsMap);

      const mockToolsListingResponse = {
        id: '123',
        jsonrpc: '2.0',
        result: expect.objectContaining({
          ...MCP_SERVER_METADATA,
          capabilities: {
            tools: { listChanged: false },
          },
          tools: [
            {
              name: 'testTool',
              description: 'Test tool',
              inputSchema: { type: 'object', properties: {} },
            },
          ],
        }),
      };

      mcpToolExecutorService.handleToolsListing.mockReturnValue(
        mockToolsListingResponse,
      );

      const mockRequest: JsonRpc = {
        jsonrpc: '2.0',
        method: 'tools/list',
        id: '123',
      };

      const result = await service.handleMCPCoreQuery(mockRequest, {
        workspace: mockWorkspace,
        userWorkspaceId: mockUserWorkspaceId,
        apiKey: undefined,
      });

      expect(result).toMatchObject(mockToolsListingResponse);
    });

    it('should handle error when AI is disabled', async () => {
      featureFlagService.isFeatureEnabled.mockResolvedValue(false);

      const mockRequest: JsonRpc = {
        jsonrpc: '2.0',
        method: 'tools/list',
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
          ...MCP_SERVER_METADATA,
          code: HttpStatus.FORBIDDEN,
          message: 'AI feature is not enabled for this workspace',
        },
      });
    });

    it('should handle error when tool is not found', async () => {
      featureFlagService.isFeatureEnabled.mockResolvedValue(true);
      userRoleService.getRoleIdForUserWorkspace.mockResolvedValue(mockRoleId);
      toolRegistryService.getToolsByCategories.mockResolvedValue({});

      mcpToolExecutorService.handleToolCall.mockRejectedValue(
        new HttpException(
          "Tool 'nonExistentTool' not found",
          HttpStatus.NOT_FOUND,
        ),
      );

      const mockRequest: JsonRpc = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'nonExistentTool', arguments: {} },
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
          ...MCP_SERVER_METADATA,
          code: HttpStatus.NOT_FOUND,
          message: "Tool 'nonExistentTool' not found",
        },
      });
    });
  });
});
