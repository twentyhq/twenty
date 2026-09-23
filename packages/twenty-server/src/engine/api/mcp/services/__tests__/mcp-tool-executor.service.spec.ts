import { Test, type TestingModule } from '@nestjs/testing';

import { zodSchema, type ToolSet } from 'ai';
import { z } from 'zod';

import { JSON_RPC_ERROR_CODE } from 'src/engine/api/mcp/constants/json-rpc-error-code.const';
import { McpToolExecutorService } from 'src/engine/api/mcp/services/mcp-tool-executor.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { MAX_INLINE_TOOL_OUTPUT_BYTES } from 'src/engine/core-modules/tool/tools/output-navigation-tool/constants/max-inline-tool-output-bytes.constant';

type JsonRpcResponse = Awaited<
  ReturnType<McpToolExecutorService['handleToolCall']>
>;

const getError = (response: JsonRpcResponse) =>
  (response as unknown as { error: { code: number; message: string } }).error;

const getResult = (response: JsonRpcResponse) =>
  (
    response as unknown as {
      result: { content: { type: string; text: string }[]; isError: boolean };
    }
  ).result;

describe('McpToolExecutorService', () => {
  let service: McpToolExecutorService;
  let metricsService: jest.Mocked<MetricsService>;

  const buildToolSet = (execute: jest.Mock): ToolSet =>
    ({
      create_person: {
        description: 'Create a person',
        inputSchema: {},
        execute,
      },
    }) as unknown as ToolSet;

  beforeEach(async () => {
    metricsService = {
      incrementCounterBy: jest.fn(),
      recordHistogram: jest.fn(),
    } as unknown as jest.Mocked<MetricsService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        McpToolExecutorService,
        {
          provide: MetricsService,
          useValue: metricsService,
        },
      ],
    }).compile();

    service = module.get(McpToolExecutorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleToolCall', () => {
    it('should return isError false and count a success when the tool output succeeds', async () => {
      const toolOutput = { success: true, message: 'Created' };
      const toolSet = buildToolSet(jest.fn().mockResolvedValue(toolOutput));

      const response = await service.handleToolCall(1, toolSet, {
        name: 'create_person',
        arguments: {},
      });

      expect(response).toEqual({
        id: 1,
        jsonrpc: '2.0',
        result: {
          content: [{ type: 'text', text: JSON.stringify(toolOutput) }],
          isError: false,
        },
      });
      expect(metricsService.incrementCounterBy).toHaveBeenCalledWith(
        expect.objectContaining({
          key: MetricsKeys.McpToolExecutionSucceeded,
        }),
      );
    });

    it('should reject arguments the advertised schema does not accept', async () => {
      const execute = jest.fn();
      const toolSet = {
        create_person: {
          description: 'Create a person',
          inputSchema: zodSchema(z.object({ name: z.string() })),
          execute,
        },
      } as unknown as ToolSet;

      const response = await service.handleToolCall(1, toolSet, {
        name: 'create_person',
        arguments: { name: 42 },
      });

      expect(execute).not.toHaveBeenCalled();
      expect(getError(response).code).toBe(JSON_RPC_ERROR_CODE.INVALID_PARAMS);
      expect(getError(response).message).toContain(
        'Invalid arguments for tool create_person',
      );
    });

    it('should apply schema defaults before executing, and accept absent arguments', async () => {
      const execute = jest.fn().mockResolvedValue({ success: true });
      const toolSet = {
        create_person: {
          description: 'Create a person',
          inputSchema: zodSchema(
            z.object({ limit: z.number().optional().default(10) }),
          ),
          execute,
        },
      } as unknown as ToolSet;

      await service.handleToolCall(1, toolSet, { name: 'create_person' });

      expect(execute).toHaveBeenCalledWith({ limit: 10 }, expect.anything());
    });

    it('should bound an oversized tool output while keeping the payload parseable', async () => {
      const toolOutput = {
        success: true,
        message: 'Found 215 tool(s)',
        result: { catalog: 'x'.repeat(MAX_INLINE_TOOL_OUTPUT_BYTES * 2) },
      };
      const toolSet = buildToolSet(jest.fn().mockResolvedValue(toolOutput));

      const response = await service.handleToolCall(1, toolSet, {
        name: 'create_person',
        arguments: {},
      });

      const text = getResult(response).content[0].text;
      const payload = JSON.parse(text);

      expect(Buffer.byteLength(text)).toBeLessThan(
        Buffer.byteLength(JSON.stringify(toolOutput)),
      );
      expect(payload).toEqual({
        success: true,
        message: 'Found 215 tool(s)',
        result: {
          truncated: true,
          originalSizeBytes: Buffer.byteLength(JSON.stringify(toolOutput)),
          content: expect.stringContaining('[TRUNCATED:'),
        },
      });
      expect(payload.result.content).toContain('Narrow the call');
      expect(getResult(response).isError).toBe(false);
    });

    it('should leave a tool output under the inline budget untouched', async () => {
      const toolOutput = {
        success: true,
        message: 'Created',
        result: { id: 1 },
      };
      const toolSet = buildToolSet(jest.fn().mockResolvedValue(toolOutput));

      const response = await service.handleToolCall(1, toolSet, {
        name: 'create_person',
        arguments: {},
      });

      expect(getResult(response).content[0].text).toBe(
        JSON.stringify(toolOutput),
      );
    });

    it('should return isError true and count a failure when the tool output resolves with success false', async () => {
      const toolOutput = {
        success: false,
        message: 'Validation failed',
        error: 'Missing required field',
      };
      const toolSet = buildToolSet(jest.fn().mockResolvedValue(toolOutput));

      const response = await service.handleToolCall(1, toolSet, {
        name: 'create_person',
        arguments: {},
      });

      expect(response).toEqual({
        id: 1,
        jsonrpc: '2.0',
        result: {
          content: [{ type: 'text', text: JSON.stringify(toolOutput) }],
          isError: true,
        },
      });
      expect(metricsService.incrementCounterBy).toHaveBeenCalledWith(
        expect.objectContaining({
          key: MetricsKeys.McpToolExecutionFailed,
        }),
      );
    });

    it('should return isError true and count a failure when the tool throws', async () => {
      const toolSet = buildToolSet(
        jest.fn().mockRejectedValue(new Error('Database unavailable')),
      );

      const response = await service.handleToolCall(1, toolSet, {
        name: 'create_person',
        arguments: {},
      });

      expect(response).toEqual({
        id: 1,
        jsonrpc: '2.0',
        result: {
          content: [{ type: 'text', text: 'Database unavailable' }],
          isError: true,
        },
      });
      expect(metricsService.incrementCounterBy).toHaveBeenCalledWith(
        expect.objectContaining({
          key: MetricsKeys.McpToolExecutionFailed,
        }),
      );
    });
  });
});
