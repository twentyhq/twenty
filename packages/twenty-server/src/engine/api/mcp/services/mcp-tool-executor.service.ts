import { Injectable } from '@nestjs/common';

import { isString } from '@sniptt/guards';
import { asSchema, type ToolExecuteFunction } from 'ai';
import { isDefined } from 'twenty-shared/utils';

import { TOOL_EXECUTION_DURATION_MS_BUCKET_BOUNDARIES } from 'src/engine/core-modules/metrics/constants/tool-execution-duration-ms-bucket-boundaries.constant';
import { TOOL_OUTPUT_TOKENS_BUCKET_BOUNDARIES } from 'src/engine/core-modules/metrics/constants/tool-output-tokens-bucket-boundaries.constant';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { estimateToolOutputTokens } from 'src/engine/core-modules/tool-provider/utils/estimate-tool-output-tokens.util';
import { getToolMetricName } from 'src/engine/core-modules/tool-provider/utils/get-tool-metric-name.util';
import { isToolOutputSuccessful } from 'src/engine/core-modules/tool-provider/utils/is-tool-output-successful.util';
import { resolveToolName } from 'src/engine/core-modules/tool-provider/utils/resolve-tool-name.util';

import { MCP_PROGRESS_NOTIFICATION_METHOD } from 'src/engine/api/mcp/constants/mcp-progress-notification.const';
import {
  McpException,
  McpExceptionCode,
} from 'src/engine/api/mcp/exceptions/mcp.exception';
import { type McpListedTool } from 'src/engine/api/mcp/types/mcp-listed-tool.type';
import { type McpToolCallResult } from 'src/engine/api/mcp/types/mcp-tool-call-result.type';
import { type McpToolSet } from 'src/engine/api/mcp/types/mcp-tool-set.type';
import { type McpToolsListResult } from 'src/engine/api/mcp/types/mcp-tools-list-result.type';

@Injectable()
export class McpToolExecutorService {
  constructor(private readonly metricsService: MetricsService) {}

  async handleToolCall({
    toolSet,
    toolName,
    toolArguments,
    progressToken,
    sseWriter,
  }: {
    toolSet: McpToolSet;
    toolName: string;
    toolArguments: Record<string, unknown> | undefined;
    progressToken: string | number | undefined;
    sseWriter?: (data: Record<string, unknown>) => void;
  }): Promise<McpToolCallResult> {
    const tool = toolSet[toolName];

    if (!isDefined(tool) || !isDefined(tool.execute)) {
      throw new McpException(
        `Unknown tool: ${toolName}`,
        McpExceptionCode.INVALID_PARAMS,
      );
    }

    if (isDefined(sseWriter) && isDefined(progressToken)) {
      sseWriter({
        jsonrpc: '2.0',
        method: MCP_PROGRESS_NOTIFICATION_METHOD,
        params: {
          progressToken,
          progress: 0,
          total: 1,
        },
      });
    }

    const metricToolName = getToolMetricName(
      resolveToolName({
        toolName,
        input: toolArguments,
      }),
    );

    const executionStartedAt = performance.now();

    try {
      // ToolSet widens execute to a union no argument satisfies
      const execute = tool.execute as ToolExecuteFunction<
        unknown,
        unknown,
        undefined
      >;
      const result = await execute(toolArguments, {
        toolCallId: '1',
        messages: [],
        context: undefined,
      });

      const succeeded = isToolOutputSuccessful(result);

      this.recordToolExecutionMetrics({
        metricToolName,
        executionStartedAt,
        succeeded,
      });

      this.metricsService.recordHistogram({
        key: MetricsKeys.McpToolOutputTokens,
        value: estimateToolOutputTokens(result),
        unit: 'token',
        attributes: { tool: metricToolName },
        bucketBoundaries: TOOL_OUTPUT_TOKENS_BUCKET_BOUNDARIES,
      });

      return {
        content: [{ type: 'text', text: JSON.stringify(result) }],
        isError: !succeeded,
      };
    } catch (executionError) {
      this.recordToolExecutionMetrics({
        metricToolName,
        executionStartedAt,
        succeeded: false,
      });

      return {
        content: [
          {
            type: 'text',
            text:
              executionError instanceof Error
                ? executionError.message
                : 'Tool execution failed',
          },
        ],
        isError: true,
      };
    }
  }

  async handleToolsListing(toolSet: McpToolSet): Promise<McpToolsListResult> {
    const tools = await Promise.all(
      Object.entries(toolSet)
        .filter(([, tool]) => isDefined(tool.inputSchema))
        .map(async ([name, tool]): Promise<McpListedTool> => ({
          name,
          // AI SDK v7 also allows a description resolver, which MCP clients cannot call
          description: isString(tool.description)
            ? tool.description
            : undefined,
          inputSchema: {
            ...(await asSchema(tool.inputSchema).jsonSchema),
            type: 'object',
          },
          annotations: tool.annotations,
        })),
    );

    return { tools };
  }

  private recordToolExecutionMetrics({
    metricToolName,
    executionStartedAt,
    succeeded,
  }: {
    metricToolName: string;
    executionStartedAt: number;
    succeeded: boolean;
  }) {
    this.metricsService.recordHistogram({
      key: MetricsKeys.McpToolExecutionDurationMs,
      value: performance.now() - executionStartedAt,
      unit: 'ms',
      attributes: { tool: metricToolName },
      bucketBoundaries: TOOL_EXECUTION_DURATION_MS_BUCKET_BOUNDARIES,
    });

    this.metricsService.incrementCounterBy({
      key: succeeded
        ? MetricsKeys.McpToolExecutionSucceeded
        : MetricsKeys.McpToolExecutionFailed,
      amount: 1,
      attributes: { tool: metricToolName },
    });
  }
}
