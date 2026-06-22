import { JSON_RPC_ERROR_CODE } from 'src/engine/api/mcp/constants/json-rpc-error-code.const';
import { MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS } from 'src/engine/api/mcp/constants/mcp-closed-world-read-only-tool-annotations.const';
import {
  MCP_PROGRESS_NOTIFICATION_METHOD,
  TOOL_CALL_PROGRESS_TOKEN_PREFIX,
} from 'src/engine/api/mcp/constants/mcp-progress-notification.const';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { McpToolExecutorService } from 'src/engine/api/mcp/services/mcp-tool-executor.service';

describe('McpToolExecutorService', () => {
  let service: McpToolExecutorService;
  let metricsService: jest.Mocked<MetricsService>;

  beforeEach(() => {
    metricsService = {
      incrementCounterBy: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<MetricsService>;

    service = new McpToolExecutorService(metricsService);
  });

  describe('handleToolsListing', () => {
    it('should return only tools array in result', () => {
      const toolSet = {
        test_tool: {
          description: 'A test tool',
          inputSchema: {
            jsonSchema: {
              type: 'object',
              properties: { query: { type: 'string' } },
              required: ['query'],
            },
          },
          annotations: MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
        },
      } as any;

      const result = service.handleToolsListing('123', toolSet);

      expect(result).toEqual({
        id: '123',
        jsonrpc: '2.0',
        result: {
          tools: [
            {
              name: 'test_tool',
              description: 'A test tool',
              inputSchema: {
                type: 'object',
                properties: { query: { type: 'string' } },
                required: ['query'],
              },
              annotations: MCP_CLOSED_WORLD_READ_ONLY_TOOL_ANNOTATIONS,
            },
          ],
        },
      });
    });

    it('should keep inputSchema unchanged when it is already a plain schema', () => {
      const toolSet = {
        plain_tool: {
          description: 'A plain schema tool',
          inputSchema: {
            type: 'object',
            properties: { name: { type: 'string' } },
          },
        },
      } as any;

      const result = service.handleToolsListing('456', toolSet);

      expect(result).toEqual({
        id: '456',
        jsonrpc: '2.0',
        result: {
          tools: [
            {
              name: 'plain_tool',
              description: 'A plain schema tool',
              inputSchema: {
                type: 'object',
                properties: { name: { type: 'string' } },
              },
            },
          ],
        },
      });
    });
  });

  describe('handleToolCall', () => {
    it('should return JSON-RPC error with INVALID_PARAMS for unknown tools', async () => {
      const toolSet = {} as any;

      const result = await service.handleToolCall('123', toolSet, {
        name: 'nonexistent_tool',
        arguments: {},
      });

      expect(result).toEqual({
        id: '123',
        jsonrpc: '2.0',
        error: {
          code: JSON_RPC_ERROR_CODE.INVALID_PARAMS,
          message: 'Unknown tool: nonexistent_tool',
        },
      });
      expect(metricsService.incrementCounterBy).toHaveBeenCalledWith({
        key: MetricsKeys.McpToolExecutionFailed,
        amount: 1,
        attributes: {
          toolName: 'nonexistent_tool',
          failureType: 'unknown_tool',
        },
      });
    });

    it('should return result with isError: false on success', async () => {
      const toolSet = {
        my_tool: {
          execute: jest.fn().mockResolvedValue({ data: 'ok' }),
          description: 'My tool',
          inputSchema: { type: 'object' },
        },
      } as any;

      const result = await service.handleToolCall('123', toolSet, {
        name: 'my_tool',
        arguments: {},
      });

      expect(result).toEqual({
        id: '123',
        jsonrpc: '2.0',
        result: {
          content: [{ type: 'text', text: '{"data":"ok"}' }],
          isError: false,
        },
      });
      expect(metricsService.incrementCounterBy).toHaveBeenCalledWith({
        key: MetricsKeys.McpToolExecutionSucceeded,
        amount: 1,
        attributes: {
          toolName: 'my_tool',
          outcome: 'success',
        },
      });
    });

    it('should return result with isError: true when tool execution throws', async () => {
      const toolSet = {
        failing_tool: {
          execute: jest.fn().mockRejectedValue(new Error('API rate limited')),
          description: 'A tool that fails',
          inputSchema: { type: 'object' },
        },
      } as any;

      const result = await service.handleToolCall('123', toolSet, {
        name: 'failing_tool',
        arguments: {},
      });

      expect(result).toEqual({
        id: '123',
        jsonrpc: '2.0',
        result: {
          content: [{ type: 'text', text: 'API rate limited' }],
          isError: true,
        },
      });
      expect(metricsService.incrementCounterBy).toHaveBeenCalledWith({
        key: MetricsKeys.McpToolExecutionFailed,
        amount: 1,
        attributes: {
          toolName: 'failing_tool',
          failureType: 'exception',
        },
      });
    });

    it('should return isError true and failed metric when tool returns success false', async () => {
      const toolSet = {
        failing_tool: {
          execute: jest.fn().mockResolvedValue({
            success: false,
            message: 'Validation error',
            failureType: 'validation',
          }),
          description: 'A tool that returns failed output',
          inputSchema: { type: 'object' },
        },
      } as any;

      const result = await service.handleToolCall('123', toolSet, {
        name: 'failing_tool',
        arguments: {},
      });

      expect(result).toEqual({
        id: '123',
        jsonrpc: '2.0',
        result: {
          content: [
            {
              type: 'text',
              text: '{"success":false,"message":"Validation error","failureType":"validation"}',
            },
          ],
          isError: true,
        },
      });
      expect(metricsService.incrementCounterBy).toHaveBeenCalledWith({
        key: MetricsKeys.McpToolExecutionFailed,
        amount: 1,
        attributes: {
          toolName: 'failing_tool',
          outcome: 'error',
          failureType: 'validation',
        },
      });
    });

    it('should emit progress notification via sseWriter before execution', async () => {
      const sseWriter = jest.fn();
      const toolSet = {
        my_tool: {
          execute: jest.fn().mockResolvedValue({ data: 'ok' }),
          description: 'My tool',
          inputSchema: { type: 'object' },
        },
      } as any;

      await service.handleToolCall(
        'sse-1',
        toolSet,
        { name: 'my_tool', arguments: {} },
        sseWriter,
      );

      expect(sseWriter).toHaveBeenCalledTimes(1);
      expect(sseWriter).toHaveBeenCalledWith({
        jsonrpc: '2.0',
        method: MCP_PROGRESS_NOTIFICATION_METHOD,
        params: {
          progressToken: `${TOOL_CALL_PROGRESS_TOKEN_PREFIX}sse-1`,
          progress: 0,
          total: 1,
        },
      });
    });

    it('should not emit progress notification when sseWriter is undefined', async () => {
      const toolSet = {
        my_tool: {
          execute: jest.fn().mockResolvedValue({ data: 'ok' }),
          description: 'My tool',
          inputSchema: { type: 'object' },
        },
      } as any;

      const result = await service.handleToolCall('no-sse', toolSet, {
        name: 'my_tool',
        arguments: {},
      });

      // Should still return normal result without errors
      expect(result).toEqual({
        id: 'no-sse',
        jsonrpc: '2.0',
        result: {
          content: [{ type: 'text', text: '{"data":"ok"}' }],
          isError: false,
        },
      });
    });
  });
});
