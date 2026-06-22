import { Injectable, Logger } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { isDefined } from 'twenty-shared/utils';

import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';

import { JSON_RPC_ERROR_CODE } from 'src/engine/api/mcp/constants/json-rpc-error-code.const';
import {
  MCP_PROGRESS_NOTIFICATION_METHOD,
  TOOL_CALL_PROGRESS_TOKEN_PREFIX,
} from 'src/engine/api/mcp/constants/mcp-progress-notification.const';
import { type McpToolAnnotations } from 'src/engine/api/mcp/types/mcp-tool-annotations.type';
import { wrapJsonRpcResponse } from 'src/engine/api/mcp/utils/wrap-jsonrpc-response.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

type McpToolDefinition = ToolSet[string] & {
  annotations?: McpToolAnnotations;
};

type FailedToolOutput = ToolOutput & {
  failureType?: string;
};

const unwrapJsonSchema = (schema: unknown) =>
  schema && typeof schema === 'object' && 'jsonSchema' in schema
    ? schema.jsonSchema
    : schema;

const isFailedToolOutput = (result: unknown): result is FailedToolOutput =>
  isDefined(result) &&
  typeof result === 'object' &&
  'success' in result &&
  result.success === false;

@Injectable()
export class McpToolExecutorService {
  private readonly logger = new Logger(McpToolExecutorService.name);

  constructor(private readonly metricsService: MetricsService) {}

  async handleToolCall(
    id: string | number,
    toolSet: ToolSet,
    params: Record<string, unknown>,
    sseWriter?: (data: Record<string, unknown>) => void,
  ) {
    const toolName = params.name as keyof typeof toolSet;
    const tool = toolSet[toolName];

    if (!isDefined(tool) || !isDefined(tool.execute)) {
      void this.metricsService.incrementCounterBy({
        key: MetricsKeys.McpToolExecutionFailed,
        amount: 1,
        attributes: {
          toolName: String(params.name),
          failureType: 'unknown_tool',
        },
      });

      this.logger.warn(
        `MCP tool call rejected: unknown tool "${String(params.name)}"`,
      );

      return wrapJsonRpcResponse(id, {
        error: {
          code: JSON_RPC_ERROR_CODE.INVALID_PARAMS,
          message: `Unknown tool: ${String(params.name)}`,
        },
      });
    }

    if (isDefined(sseWriter)) {
      sseWriter({
        jsonrpc: '2.0',
        method: MCP_PROGRESS_NOTIFICATION_METHOD,
        params: {
          progressToken: `${TOOL_CALL_PROGRESS_TOKEN_PREFIX}${String(id)}`,
          progress: 0,
          total: 1,
        },
      });
    }

    try {
      const result = await tool.execute(params.arguments, {
        toolCallId: '1',
        messages: [],
      });

      const hasExecutionError = isFailedToolOutput(result);
      const failureType = hasExecutionError
        ? result.failureType ?? 'execution_error'
        : undefined;

      void this.metricsService.incrementCounterBy({
        key: hasExecutionError
          ? MetricsKeys.McpToolExecutionFailed
          : MetricsKeys.McpToolExecutionSucceeded,
        amount: 1,
        attributes: {
          toolName: String(toolName),
          outcome: hasExecutionError ? 'error' : 'success',
          ...(isDefined(failureType) ? { failureType } : {}),
        },
      });

      if (hasExecutionError) {
        const message =
          result.message ?? result.error ?? 'Tool returned an error payload';

        this.logger.debug(
          `MCP tool "${String(toolName)}" returned an execution error payload (${failureType}) - ${message}`,
        );
      }

      return wrapJsonRpcResponse(id, {
        result: {
          content: [{ type: 'text', text: JSON.stringify(result) }],
          isError: hasExecutionError,
        },
      });
    } catch (executionError) {
      void this.metricsService.incrementCounterBy({
        key: MetricsKeys.McpToolExecutionFailed,
        amount: 1,
        attributes: {
          toolName: String(toolName),
          failureType: 'exception',
        },
      });

      this.logger.error(
        `MCP tool "${String(toolName)}" execution threw`,
        executionError instanceof Error ? executionError.stack : undefined,
      );

      return wrapJsonRpcResponse(id, {
        result: {
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
        },
      });
    }
  }

  handleToolsListing(id: string | number, toolSet: ToolSet) {
    const toolsArray = Object.entries(toolSet)
      .filter(([, def]) => !!def.inputSchema)
      .map(([name, def]) => {
        const toolDefinition = def as McpToolDefinition;
        // Unwrap the AI SDK's jsonSchema wrapper if present
        // The AI SDK serializes schemas as { jsonSchema: {...} } but MCP expects {...} directly
        const inputSchema = unwrapJsonSchema(toolDefinition.inputSchema);

        return {
          name,
          description: toolDefinition.description,
          inputSchema,
          ...(isDefined(toolDefinition.annotations) && {
            annotations: toolDefinition.annotations,
          }),
        };
      });

    return wrapJsonRpcResponse(id, {
      result: {
        tools: toolsArray,
      },
    });
  }
}
