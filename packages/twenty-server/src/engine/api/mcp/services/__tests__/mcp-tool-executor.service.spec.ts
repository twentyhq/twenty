import { Test, type TestingModule } from '@nestjs/testing';

import { type ToolSet } from 'ai';

import { McpToolExecutorService } from 'src/engine/api/mcp/services/mcp-tool-executor.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { MAX_INLINE_TOOL_OUTPUT_BYTES } from 'src/engine/core-modules/tool/tools/output-navigation-tool/constants/max-inline-tool-output-bytes.constant';

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

      const text = response?.result.content[0].text as string;
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
      expect(response?.result.isError).toBe(false);
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

      expect(response?.result.content[0].text).toBe(JSON.stringify(toolOutput));
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
