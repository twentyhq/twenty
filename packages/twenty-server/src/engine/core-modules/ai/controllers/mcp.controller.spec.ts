import { Test, TestingModule } from '@nestjs/testing';

import { McpService } from 'src/engine/core-modules/ai/services/mcp.service';
import { JsonRpc } from 'src/engine/core-modules/ai/dtos/json-rpc';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { MCP_SERVER_METADATA } from 'src/engine/core-modules/ai/constants/mcp.const';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

import { McpController } from './mcp.controller';

describe('McpController', () => {
  let controller: McpController;
  let mcpService: jest.Mocked<McpService>;

  beforeEach(async () => {
    const mockMcpService = {
      executeTool: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [McpController],
      providers: [
        {
          provide: McpService,
          useValue: mockMcpService,
        },
        {
          provide: AccessTokenService,
          useValue: jest.fn(),
        },
        {
          provide: WorkspaceCacheStorageService,
          useValue: jest.fn(),
        },
      ],
    }).compile();

    controller = module.get<McpController>(McpController);
    mcpService = module.get(McpService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('executeTool', () => {
    const mockWorkspace = { id: 'workspace-1' } as Workspace;
    const mockUserWorkspaceId = 'user-workspace-1';
    const mockApiKey = 'api-key-1';

    it('should call mcpService.executeTool with correct parameters', async () => {
      const mockRequest: JsonRpc = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'testTool', arguments: { arg1: 'value1' } },
        id: '123',
      };

      const mockResponse = {
        id: '123',
        jsonrpc: '2.0',
        result: {
          content: [{ type: 'text', text: '{"result":"success"}' }],
          isError: false,
        },
      };

      mcpService.executeTool.mockResolvedValue(mockResponse);

      const result = await controller.executeMcpMethods(
        mockRequest,
        mockWorkspace,
        mockApiKey,
        mockUserWorkspaceId,
      );

      expect(mcpService.executeTool).toHaveBeenCalledWith(mockRequest, {
        workspace: mockWorkspace,
        userWorkspaceId: mockUserWorkspaceId,
        apiKey: mockApiKey,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle initialize method', async () => {
      const mockRequest: JsonRpc = {
        jsonrpc: '2.0',
        method: 'initialize',
        id: '123',
      };

      const mockResponse = {
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
      };

      mcpService.executeTool.mockResolvedValue(mockResponse);

      const result = await controller.executeMcpMethods(
        mockRequest,
        mockWorkspace,
        mockApiKey,
        mockUserWorkspaceId,
      );

      expect(mcpService.executeTool).toHaveBeenCalledWith(mockRequest, {
        workspace: mockWorkspace,
        userWorkspaceId: mockUserWorkspaceId,
        apiKey: mockApiKey,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle tools listing', async () => {
      const mockRequest: JsonRpc = {
        jsonrpc: '2.0',
        method: 'tools/list',
        id: '123',
      };

      const mockResponse = {
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
              description: 'A test tool',
              inputSchema: { type: 'object', properties: {} },
            },
          ],
        },
      };

      mcpService.executeTool.mockResolvedValue(mockResponse);

      const result = await controller.executeMcpMethods(
        mockRequest,
        mockWorkspace,
        mockApiKey,
        mockUserWorkspaceId,
      );

      expect(mcpService.executeTool).toHaveBeenCalledWith(mockRequest, {
        workspace: mockWorkspace,
        userWorkspaceId: mockUserWorkspaceId,
        apiKey: mockApiKey,
      });
      expect(result).toEqual(mockResponse);
    });
  });
});
