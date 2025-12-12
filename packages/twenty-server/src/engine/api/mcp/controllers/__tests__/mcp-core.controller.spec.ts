import { Test, type TestingModule } from '@nestjs/testing';

import { MCP_SERVER_METADATA } from 'src/engine/api/mcp/constants/mcp.const';
import { McpCoreController } from 'src/engine/api/mcp/controllers/mcp-core.controller';
import { type JsonRpc } from 'src/engine/api/mcp/dtos/json-rpc';
import { McpProtocolService } from 'src/engine/api/mcp/services/mcp-protocol.service';
import { type ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

describe('McpCoreController', () => {
  let controller: McpCoreController;
  let mcpProtocolService: jest.Mocked<McpProtocolService>;

  beforeEach(async () => {
    const mockMcpProtocolService = {
      handleMCPCoreQuery: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [McpCoreController],
      providers: [
        {
          provide: McpProtocolService,
          useValue: mockMcpProtocolService,
        },
        {
          provide: AccessTokenService,
          useValue: jest.fn(),
        },
        {
          provide: WorkspaceCacheStorageService,
          useValue: jest.fn(),
        },
        {
          provide: HttpExceptionHandlerService,
          useValue: {
            handleError: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<McpCoreController>(McpCoreController);
    mcpProtocolService = module.get(McpProtocolService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleMcpCore', () => {
    const mockWorkspace = { id: 'workspace-1' } as WorkspaceEntity;
    const mockUserWorkspaceId = 'user-workspace-1';
    const mockApiKey = { id: 'api-key-1' } as ApiKeyEntity;

    it('should call mcpProtocolService.handleMCPCoreQuery with correct parameters', async () => {
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

      mcpProtocolService.handleMCPCoreQuery.mockResolvedValue(mockResponse);

      const result = await controller.handleMcpCore(
        mockRequest,
        mockWorkspace,
        mockApiKey,
        mockUserWorkspaceId,
      );

      expect(mcpProtocolService.handleMCPCoreQuery).toHaveBeenCalledWith(
        mockRequest,
        {
          workspace: mockWorkspace,
          userWorkspaceId: mockUserWorkspaceId,
          apiKey: mockApiKey,
        },
      );
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

      mcpProtocolService.handleMCPCoreQuery.mockResolvedValue(mockResponse);

      const result = await controller.handleMcpCore(
        mockRequest,
        mockWorkspace,
        mockApiKey,
        mockUserWorkspaceId,
      );

      expect(mcpProtocolService.handleMCPCoreQuery).toHaveBeenCalledWith(
        mockRequest,
        {
          workspace: mockWorkspace,
          userWorkspaceId: mockUserWorkspaceId,
          apiKey: mockApiKey,
        },
      );
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

      mcpProtocolService.handleMCPCoreQuery.mockResolvedValue(mockResponse);

      const result = await controller.handleMcpCore(
        mockRequest,
        mockWorkspace,
        mockApiKey,
        mockUserWorkspaceId,
      );

      expect(mcpProtocolService.handleMCPCoreQuery).toHaveBeenCalledWith(
        mockRequest,
        {
          workspace: mockWorkspace,
          userWorkspaceId: mockUserWorkspaceId,
          apiKey: mockApiKey,
        },
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
