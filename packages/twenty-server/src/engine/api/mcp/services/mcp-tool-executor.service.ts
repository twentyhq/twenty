import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { isDefined } from 'twenty-shared/utils';

import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { estimateToolOutputTokens } from 'src/engine/core-modules/tool-provider/utils/estimate-tool-output-tokens.util';
import { isToolOutputSuccessful } from 'src/engine/core-modules/tool-provider/utils/is-tool-output-successful.util';
import { resolveToolName } from 'src/engine/core-modules/tool-provider/utils/resolve-tool-name.util';

import { JSON_RPC_ERROR_CODE } from 'src/engine/api/mcp/constants/json-rpc-error-code.const';
import {
  MCP_PROGRESS_NOTIFICATION_METHOD,
  TOOL_CALL_PROGRESS_TOKEN_PREFIX,
} from 'src/engine/api/mcp/constants/mcp-progress-notification.const';
import { type McpToolAnnotations } from 'src/engine/api/mcp/types/mcp-tool-annotations.type';
import { wrapJsonRpcResponse } from 'src/engine/api/mcp/utils/wrap-jsonrpc-response.util';

type McpToolDefinition = ToolSet[string] & {
  annotations?: McpToolAnnotations;
};

const unwrapJsonSchema = (schema: unknown) =>
  schema && typeof schema === 'object' && 'jsonSchema' in schema
    ? schema.jsonSchema
    : schema;

@Injectable()
export class McpToolExecutorService {
  constructor(private readonly metricsService: MetricsService) {}

  async handleToolCall(
    id: string | number,
    toolSet: ToolSet,
    params: Record<string, unknown>,
    sseWriter?: (data: Record<string, unknown>) => void,
  ) {
    const toolName = String(params.name);
    const tool = toolSet[toolName as keyof typeof toolSet];

    if (!isDefined(tool) || !isDefined(tool.execute)) {
      return wrapJsonRpcResponse(id, {
        error: {
          code: JSON_RPC_ERROR_CODE.INVALID_PARAMS,
          message: `Unknown tool: ${toolName}`,
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

    const metricToolName = resolveToolName({
      toolName,
      input: params.arguments,
    });

    try {
      const result = await tool.execute(params.arguments, {
        toolCallId: '1',
        messages: [],
      });

      const succeeded = isToolOutputSuccessful(result);

      this.metricsService.incrementCounterBy({
        key: succeeded
          ? MetricsKeys.McpToolExecutionSucceeded
          : MetricsKeys.McpToolExecutionFailed,
        amount: 1,
        attributes: { tool: metricToolName },
      });

      this.metricsService.recordHistogram({
        key: MetricsKeys.McpToolOutputTokens,
        value: estimateToolOutputTokens(result),
        unit: 'token',
        attributes: { tool: metricToolName },
      });

      return wrapJsonRpcResponse(id, {
        result: {
          content: [{ type: 'text', text: JSON.stringify(result) }],
          isError: false,
        },
      });
    } catch (executionError) {
      this.metricsService.incrementCounterBy({
        key: MetricsKeys.McpToolExecutionFailed,
        amount: 1,
        attributes: { tool: metricToolName },
      });

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
