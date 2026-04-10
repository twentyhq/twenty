import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { isDefined } from 'twenty-shared/utils';

import { JSON_RPC_ERROR_CODE } from 'src/engine/api/mcp/constants/json-rpc-error-code.const';
import {
  MCP_PROGRESS_NOTIFICATION_METHOD,
  TOOL_CALL_PROGRESS_TOKEN_PREFIX,
} from 'src/engine/api/mcp/constants/mcp-progress-notification.const';
import { wrapJsonRpcResponse } from 'src/engine/api/mcp/utils/wrap-jsonrpc-response.util';

@Injectable()
export class McpToolExecutorService {
  async handleToolCall(
    id: string | number,
    toolSet: ToolSet,
    params: Record<string, unknown>,
    sseWriter?: (data: Record<string, unknown>) => void,
  ) {
    const toolName = params.name as keyof typeof toolSet;
    const tool = toolSet[toolName];

    if (!isDefined(tool) || !isDefined(tool.execute)) {
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

      return wrapJsonRpcResponse(id, {
        result: {
          content: [{ type: 'text', text: JSON.stringify(result) }],
          isError: false,
        },
      });
    } catch (executionError) {
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
        // Unwrap the AI SDK's jsonSchema wrapper if present
        // The AI SDK serializes schemas as { jsonSchema: {...} } but MCP expects {...} directly
        const inputSchema = def.inputSchema;
        const unwrappedSchema =
          inputSchema &&
          typeof inputSchema === 'object' &&
          'jsonSchema' in inputSchema
            ? inputSchema.jsonSchema
            : inputSchema;

        return {
          name,
          description: def.description,
          inputSchema: unwrappedSchema,
        };
      });

    return wrapJsonRpcResponse(id, {
      result: {
        tools: toolsArray,
      },
    });
  }
}
