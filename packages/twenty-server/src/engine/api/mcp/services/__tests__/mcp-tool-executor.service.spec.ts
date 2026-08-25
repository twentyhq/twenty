import { Test, type TestingModule } from '@nestjs/testing';

import { type ToolSet } from 'ai';

import { McpToolExecutorService } from 'src/engine/api/mcp/services/mcp-tool-executor.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';

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
