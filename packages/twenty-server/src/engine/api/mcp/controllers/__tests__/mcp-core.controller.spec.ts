import { Test, type TestingModule } from '@nestjs/testing';

import { DEFAULT_TOOL_INPUT_SCHEMA } from 'twenty-shared/logic-function';

import { MCP_PROTOCOL_VERSION } from 'src/engine/api/mcp/constants/mcp-protocol-version.const';
import { MCP_SERVER_INFO } from 'src/engine/api/mcp/constants/mcp-server-info.const';
import { MCP_SERVER_INSTRUCTIONS } from 'src/engine/api/mcp/constants/mcp-server-instructions.const';
import { McpCoreController } from 'src/engine/api/mcp/controllers/mcp-core.controller';
import { type JsonRpc } from 'src/engine/api/mcp/dtos/json-rpc';
import { McpAuthGuard } from 'src/engine/api/mcp/guards/mcp-auth.guard';
import { McpProtocolService } from 'src/engine/api/mcp/services/mcp-protocol.service';
import { type FlatApiKey } from 'src/engine/core-modules/api-key/types/flat-api-key.type';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AccessTokenService } from 'src/engine/core-modules/auth/token/services/access-token.service';
import { HttpExceptionHandlerService } from 'src/engine/core-modules/exception-handler/http-exception-handler.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type UserEntity } from 'src/engine/core-modules/user/user.entity';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
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
        {
          provide: JwtAuthGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
        {
          provide: TwentyConfigService,
          useValue: { get: jest.fn().mockReturnValue('http://localhost:3000') },
        },
        McpAuthGuard,
      ],
    }).compile();

    controller = module.get<McpCoreController>(McpCoreController);
    mcpProtocolService = module.get(McpProtocolService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleMcpCore', () => {
    const mockWorkspace = { id: 'workspace-1' } as FlatWorkspace;
    const mockUser = { id: 'user-1' } as UserEntity;
    const mockUserWorkspaceId = 'user-workspace-1';
    const mockApiKey = { id: 'api-key-1' } as FlatApiKey;
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      setHeader: jest.fn(),
      write: jest.fn(),
      end: jest.fn(),
    } as unknown as import('express').Response;

    beforeEach(() => {
      (mockRes.status as jest.Mock).mockClear();
      (mockRes.setHeader as jest.Mock).mockClear();
      (mockRes.write as jest.Mock).mockClear();
      (mockRes.end as jest.Mock).mockClear();
    });

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
        mockUser,
        mockUserWorkspaceId,
        undefined,
        mockRes,
      );

      expect(mcpProtocolService.handleMCPCoreQuery).toHaveBeenCalledWith(
        mockRequest,
        {
          workspace: mockWorkspace,
          userId: mockUser.id,
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
          protocolVersion: MCP_PROTOCOL_VERSION,
          capabilities: {
            tools: { listChanged: false },
            resources: { listChanged: false },
            prompts: { listChanged: false },
          },
          serverInfo: MCP_SERVER_INFO,
          instructions: MCP_SERVER_INSTRUCTIONS,
        },
      };

      mcpProtocolService.handleMCPCoreQuery.mockResolvedValue(mockResponse);

      const result = await controller.handleMcpCore(
        mockRequest,
        mockWorkspace,
        mockApiKey,
        mockUser,
        mockUserWorkspaceId,
        undefined,
        mockRes,
      );

      expect(mcpProtocolService.handleMCPCoreQuery).toHaveBeenCalledWith(
        mockRequest,
        {
          workspace: mockWorkspace,
          userId: mockUser.id,
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
          tools: [
            {
              name: 'testTool',
              description: 'A test tool',
              inputSchema: DEFAULT_TOOL_INPUT_SCHEMA,
            },
          ],
        },
      };

      mcpProtocolService.handleMCPCoreQuery.mockResolvedValue(mockResponse);

      const result = await controller.handleMcpCore(
        mockRequest,
        mockWorkspace,
        mockApiKey,
        mockUser,
        mockUserWorkspaceId,
        undefined,
        mockRes,
      );

      expect(mcpProtocolService.handleMCPCoreQuery).toHaveBeenCalledWith(
        mockRequest,
        {
          workspace: mockWorkspace,
          userId: mockUser.id,
          userWorkspaceId: mockUserWorkspaceId,
          apiKey: mockApiKey,
        },
      );
      expect(result).toEqual(mockResponse);
    });

    it('should return 202 with no body for notifications', async () => {
      const mockRequest: JsonRpc = {
        jsonrpc: '2.0',
        method: 'notifications/initialized',
      };

      mcpProtocolService.handleMCPCoreQuery.mockResolvedValue(null);

      const result = await controller.handleMcpCore(
        mockRequest,
        mockWorkspace,
        mockApiKey,
        mockUser,
        mockUserWorkspaceId,
        undefined,
        mockRes,
      );

      expect(result).toBeUndefined();
      expect(mockRes.status).toHaveBeenCalledWith(202);
    });

    it('should handle API key auth without user', async () => {
      const mockRequest: JsonRpc = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'get_tool_catalog', arguments: {} },
        id: '456',
      };

      const mockResponse = {
        id: '456',
        jsonrpc: '2.0',
        result: {
          content: [{ type: 'text', text: '{}' }],
          isError: false,
        },
      };

      mcpProtocolService.handleMCPCoreQuery.mockResolvedValue(mockResponse);

      const result = await controller.handleMcpCore(
        mockRequest,
        mockWorkspace,
        mockApiKey,
        undefined,
        undefined,
        undefined,
        mockRes,
      );

      expect(mcpProtocolService.handleMCPCoreQuery).toHaveBeenCalledWith(
        mockRequest,
        {
          workspace: mockWorkspace,
          userId: undefined,
          userWorkspaceId: undefined,
          apiKey: mockApiKey,
        },
      );
      expect(result).toEqual(mockResponse);
    });

    it('should respond with SSE when client accepts text/event-stream', async () => {
      const mockRequest: JsonRpc = {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'testTool', arguments: {} },
        id: '789',
      };

      const mockResponse = {
        id: '789',
        jsonrpc: '2.0',
        result: {
          content: [{ type: 'text', text: '{"ok":true}' }],
          isError: false,
        },
      };

      mcpProtocolService.handleMCPCoreQuery.mockResolvedValue(mockResponse);

      const result = await controller.handleMcpCore(
        mockRequest,
        mockWorkspace,
        mockApiKey,
        mockUser,
        mockUserWorkspaceId,
        'application/json, text/event-stream',
        mockRes,
      );

      // SSE path returns nothing — response is written directly
      expect(result).toBeUndefined();
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/event-stream',
      );
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        'no-cache',
      );
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Connection',
        'keep-alive',
      );
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'X-Content-Type-Options',
        'nosniff',
      );
      expect(mockRes.write).toHaveBeenCalledWith(
        `event: message\ndata: ${JSON.stringify(mockResponse)}\n\n`,
      );
      expect(mockRes.end).toHaveBeenCalled();
      // sseWriter callback should be passed to protocol service
      expect(mcpProtocolService.handleMCPCoreQuery).toHaveBeenCalledWith(
        mockRequest,
        {
          workspace: mockWorkspace,
          userId: mockUser.id,
          userWorkspaceId: mockUserWorkspaceId,
          apiKey: mockApiKey,
        },
        expect.any(Function),
      );
    });

    it('should return JSON when client only accepts application/json', async () => {
      const mockRequest: JsonRpc = {
        jsonrpc: '2.0',
        method: 'ping',
        id: '101',
      };

      const mockResponse = {
        id: '101',
        jsonrpc: '2.0',
        result: {},
      };

      mcpProtocolService.handleMCPCoreQuery.mockResolvedValue(mockResponse);

      const result = await controller.handleMcpCore(
        mockRequest,
        mockWorkspace,
        mockApiKey,
        mockUser,
        mockUserWorkspaceId,
        'application/json',
        mockRes,
      );

      expect(result).toEqual(mockResponse);
      expect(mockRes.setHeader).not.toHaveBeenCalled();
      expect(mockRes.write).not.toHaveBeenCalled();
      expect(mockRes.end).not.toHaveBeenCalled();
    });

    it('should return 202 for notifications even when client accepts SSE', async () => {
      const mockRequest: JsonRpc = {
        jsonrpc: '2.0',
        method: 'notifications/initialized',
      };

      mcpProtocolService.handleMCPCoreQuery.mockResolvedValue(null);

      const result = await controller.handleMcpCore(
        mockRequest,
        mockWorkspace,
        mockApiKey,
        mockUser,
        mockUserWorkspaceId,
        'application/json, text/event-stream',
        mockRes,
      );

      expect(result).toBeUndefined();
      expect(mockRes.status).toHaveBeenCalledWith(202);
      expect(mockRes.setHeader).not.toHaveBeenCalled();
      expect(mockRes.end).not.toHaveBeenCalled();
    });
  });
});
