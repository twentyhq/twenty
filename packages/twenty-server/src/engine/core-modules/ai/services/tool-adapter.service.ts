import { Injectable } from '@nestjs/common';

import { ToolSet, jsonSchema } from 'ai';

import { ToolInput } from 'src/engine/core-modules/tool/interfaces/tool.interface';

import {
  ToolRegistryService,
  ToolType,
} from 'src/engine/core-modules/tool/tool-registry.service';

@Injectable()
export class ToolAdapterService {
  constructor(private readonly toolRegistryService: ToolRegistryService) {}

  generateToolsForWorkspace(workspaceId: string): ToolSet {
    const tools: ToolSet = {};

    const httpTool = this.toolRegistryService.getTool(ToolType.HTTP_REQUEST);

    if (httpTool) {
      tools.http_request = {
        description:
          'Make an HTTP request to any URL with configurable method, headers, and body.',
        parameters: jsonSchema({
          type: 'object',
          properties: {
            toolDescription: {
              type: 'string',
              description:
                'A clear description of the HTTP request you want to make.',
            },
            input: {
              type: 'object',
              properties: {
                url: {
                  type: 'string',
                  description: 'The URL to make the request to',
                },
                method: {
                  type: 'string',
                  enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
                  description: 'The HTTP method to use',
                },
                headers: {
                  type: 'object',
                  description: 'HTTP headers to include in the request',
                  additionalProperties: { type: 'string' },
                },
                body: {
                  type: 'object',
                  description: 'Request body for POST, PUT, PATCH requests',
                },
              },
              required: ['url', 'method'],
            },
          },
          required: ['toolDescription', 'input'],
        }),
        execute: async (parameters) => {
          const toolInput: ToolInput = {
            parameters: parameters.input,
            context: {
              workspaceId,
            },
          };

          const result = await httpTool.execute(toolInput);

          return result.result || result.error;
        },
      };
    }

    return tools;
  }
}
