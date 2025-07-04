import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';
import { ToolService } from 'src/engine/core-modules/ai/services/tool.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { JsonRpc } from 'src/engine/core-modules/ai/dtos/json-rpc';
import { MCP_SERVER_METADATA } from 'src/engine/core-modules/ai/constants/mcp.const';
import { ADMIN_ROLE_LABEL } from 'src/engine/metadata-modules/permissions/constants/admin-role-label.constants';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';

import { McpService } from './mcp.service';

describe('McpService', () => {
  let service: McpService;
  let featureFlagService: jest.Mocked<FeatureFlagService>;
  let toolService: jest.Mocked<ToolService>;
  let userRoleService: jest.Mocked<UserRoleService>;

  const mockWorkspace = { id: 'workspace-1' } as Workspace;
  const mockUserWorkspaceId = 'user-workspace-1';
  const mockRoleId = 'role-1';
  const mockAdminRoleId = 'admin-role-1';
  const mockApiKey = 'api-key-1';

  beforeEach(async () => {
    const mockFeatureFlagService = {
      isFeatureEnabled: jest.fn(),
    };

    const mockToolService = {
      listTools: jest.fn(),
    };

    const mockUserRoleService = {
      getRoleIdForUserWorkspace: jest.fn(),
    };

    const mockAdminRole = {
      id: mockAdminRoleId,
      label: ADMIN_ROLE_LABEL,
    } as RoleEntity;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        McpService,
        {
          provide: FeatureFlagService,
          useValue: mockFeatureFlagService,
        },
        {
          provide: ToolService,
          useValue: mockToolService,
        },
        {
          provide: UserRoleService,
          useValue: mockUserRoleService,
        },
        {
          provide: getRepositoryToken(RoleEntity, 'core'),
          useValue: {
            find: jest.fn().mockResolvedValue([mockAdminRole]),
          },
        },
      ],
    }).compile();

    service = module.get<McpService>(McpService);
    featureFlagService = module.get(FeatureFlagService);
    toolService = module.get(ToolService);
    userRoleService = module.get(UserRoleService);
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

      expect(result).toEqual({
        id: requestId,
        jsonrpc: '2.0',
        result: {
          ...MCP_SERVER_METADATA,
          capabilities: {
            tools: { listChanged: false },
            resources: { listChanged: false },
            prompts: { listChanged: false },
          },
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
      userRoleService.getRoleIdForUserWorkspace.mockResolvedValue(undefined);

      await expect(
        service.getRoleId('workspace-1', 'user-workspace-1'),
      ).rejects.toThrow(
        new HttpException('Role ID missing', HttpStatus.FORBIDDEN),
      );
    });

    it('should return admin role ID when apiKey is provided', async () => {
      const result = await service.getRoleId(
        'workspace-1',
        undefined,
        mockApiKey,
      );

      expect(result).toBe(mockAdminRoleId);
    });
  });

  describe('executeTool', () => {
    it('should handle initialize method', async () => {
      featureFlagService.isFeatureEnabled.mockResolvedValue(true);

      const mockRequest: JsonRpc = {
        jsonrpc: '2.0',
        method: 'initialize',
        id: '123',
      };

      const result = await service.executeTool(mockRequest, {
        workspace: mockWorkspace,
        userWorkspaceId: mockUserWorkspaceId,
      });

      expect(result).toEqual({
        id: '123',
        jsonrpc: '2.0',
        result: {
          ...MCP_SERVER_METADATA,
          capabilities: {
            tools: { listChanged: false },
            resources: { listChanged: false },
            prompts: { listChanged: false },
          },
        },
      });
    });

    it('should handle tools/call method with userWorkspaceId', async () => {
      featureFlagService.isFeatureEnabled.mockResolvedValue(true);
      userRoleService.getRoleIdForUserWorkspace.mockResolvedValue(mockRoleId);

      const mockTool = {
        description: 'Test tool',
        parameters: { jsonSchema: { type: 'object', properties: {} } },
        execute: jest.fn().mockResolvedValue({ result: 'success' }),
      };

      const mockToolsMap = {
        testTool: mockTool,
      };

      toolService.listTools.mockResolvedValue(mockToolsMap);

      const mockRequest: JsonRpc = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'testTool', arguments: { arg1: 'value1' } },
        id: '123',
      };

      const result = await service.executeTool(mockRequest, {
        workspace: mockWorkspace,
        userWorkspaceId: mockUserWorkspaceId,
      });

      expect(result).toEqual({
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
      });

      expect(mockTool.execute).toHaveBeenCalledWith(
        { arg1: 'value1' },
        { toolCallId: '1', messages: [] },
      );
    });

    it('should handle tools/call method with apiKey', async () => {
      featureFlagService.isFeatureEnabled.mockResolvedValue(true);

      const mockTool = {
        description: 'Test tool',
        parameters: { jsonSchema: { type: 'object', properties: {} } },
        execute: jest.fn().mockResolvedValue({ result: 'success' }),
      };

      const mockToolsMap = {
        testTool: mockTool,
      };

      toolService.listTools.mockResolvedValue(mockToolsMap);

      const mockRequest: JsonRpc = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'testTool', arguments: { arg1: 'value1' } },
        id: '123',
      };

      const result = await service.executeTool(mockRequest, {
        workspace: mockWorkspace,
        apiKey: mockApiKey,
      });

      expect(result).toEqual({
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
      });

      expect(toolService.listTools).toHaveBeenCalledWith(
        mockAdminRoleId,
        mockWorkspace.id,
      );
      expect(mockTool.execute).toHaveBeenCalledWith(
        { arg1: 'value1' },
        { toolCallId: '1', messages: [] },
      );
    });

    it('should handle tools listing', async () => {
      featureFlagService.isFeatureEnabled.mockResolvedValue(true);
      userRoleService.getRoleIdForUserWorkspace.mockResolvedValue(mockRoleId);

      const mockToolsMap = {
        testTool: {
          description: 'Test tool',
          parameters: { jsonSchema: { type: 'object', properties: {} } },
        },
      };

      toolService.listTools.mockResolvedValue(mockToolsMap);

      const mockRequest: JsonRpc = {
        jsonrpc: '2.0',
        method: 'tools/list',
        id: '123',
      };

      const result = await service.executeTool(mockRequest, {
        workspace: mockWorkspace,
        userWorkspaceId: mockUserWorkspaceId,
      });

      expect(result).toEqual({
        id: '123',
        jsonrpc: '2.0',
        result: {
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
        },
      });
    });

    it('should handle error when AI is disabled', async () => {
      featureFlagService.isFeatureEnabled.mockResolvedValue(false);

      const mockRequest: JsonRpc = {
        jsonrpc: '2.0',
        method: 'tools/list',
        id: '123',
      };

      const result = await service.executeTool(mockRequest, {
        workspace: mockWorkspace,
        userWorkspaceId: mockUserWorkspaceId,
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
      toolService.listTools.mockResolvedValue({});

      const mockRequest: JsonRpc = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'nonExistentTool', arguments: {} },
        id: '123',
      };

      const result = await service.executeTool(mockRequest, {
        workspace: mockWorkspace,
        userWorkspaceId: mockUserWorkspaceId,
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
