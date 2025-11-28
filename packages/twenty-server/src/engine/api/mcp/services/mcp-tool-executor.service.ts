import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { isDefined } from 'twenty-shared/utils';

import { wrapJsonRpcResponse } from 'src/engine/api/mcp/utils/wrap-jsonrpc-response.util';

@Injectable()
export class McpToolExecutorService {
  async handleToolCall(
    id: string | number,
    toolSet: ToolSet,
    params: Record<string, unknown>,
  ) {
    const toolName = params.name as keyof typeof toolSet;
    const tool = toolSet[toolName];

    if (isDefined(tool) && isDefined(tool.execute)) {
      return wrapJsonRpcResponse(id, {
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                await tool.execute(params.arguments, {
                  toolCallId: '1',
                  messages: [],
                }),
              ),
            },
          ],
          isError: false,
        },
      });
    }

    throw new HttpException(
      `Tool '${params.name}' not found`,
      HttpStatus.NOT_FOUND,
    );
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
        capabilities: {
          tools: { listChanged: false },
        },
        tools: toolsArray,
        resources: [],
        prompts: [],
      },
    });
  }
}
