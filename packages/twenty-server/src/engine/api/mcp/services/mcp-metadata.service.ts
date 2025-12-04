import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { type Request } from 'express';

import { wrapJsonRpcResponse } from 'src/engine/api/mcp/utils/wrap-jsonrpc-response.util';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { MetadataToolsFactory } from 'src/engine/metadata-modules/metadata-tools/services/metadata-tools.factory';

@Injectable()
export class MCPMetadataService {
  constructor(
    private readonly featureFlagService: FeatureFlagService,
    private readonly metadataToolsFactory: MetadataToolsFactory,
    private readonly metricsService: MetricsService,
  ) {}

  async checkAiEnabled(workspaceId: string): Promise<void> {
    const isAiEnabled = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_AI_ENABLED,
      workspaceId,
    );

    if (!isAiEnabled) {
      throw new HttpException(
        'AI feature is not enabled for this workspace',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  handleInitialize(requestId: string | number) {
    return wrapJsonRpcResponse(requestId, {
      result: {
        capabilities: {
          tools: { listChanged: false },
          resources: { listChanged: false },
          prompts: { listChanged: false },
        },
        tools: [],
        resources: [],
        prompts: [],
      },
    });
  }

  getTools(workspaceId: string): ToolSet {
    return this.metadataToolsFactory.generateTools({ workspaceId });
  }

  async handleToolCall(
    request: Request,
    workspaceId: string,
  ): Promise<Parameters<typeof wrapJsonRpcResponse>[1]> {
    const tools = this.getTools(workspaceId);
    const toolName = request.body.params.name as keyof typeof tools;
    const tool = tools[toolName];

    if (tool && tool.execute) {
      try {
        const result = await tool.execute(
          { input: request.body.params.arguments },
          { toolCallId: '1', messages: [] },
        );

        await this.metricsService.incrementCounter({
          key: MetricsKeys.AIToolExecutionSucceeded,
          attributes: {
            tool: request.body.params.name,
          },
        });

        return { result };
      } catch (err) {
        await this.metricsService.incrementCounter({
          key: MetricsKeys.AIToolExecutionFailed,
          attributes: {
            tool: request.body.params.name,
          },
        });
        throw err;
      }
    }

    return {
      error: {
        code: HttpStatus.NOT_FOUND,
        message: `Tool ${request.body.params.name} not found`,
      },
    };
  }

  listTools(request: Request, workspaceId: string) {
    const tools = this.getTools(workspaceId);

    const toolsArray = Object.entries(tools)
      .filter(([, def]) => !!def.inputSchema)
      .map(([name, def]) => {
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

    return wrapJsonRpcResponse(request.body.id, {
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

  async handleMCPMetadataQuery(
    request: Request,
    {
      workspace,
    }: {
      workspace: WorkspaceEntity;
      userWorkspaceId?: string;
      apiKey?: string;
    },
  ): Promise<Record<string, unknown>> {
    try {
      await this.checkAiEnabled(workspace.id);

      if (request.body.method === 'initialize') {
        return this.handleInitialize(request.body.id);
      }

      if (request.body.method === 'ping') {
        return wrapJsonRpcResponse(
          request.body.id,
          {
            result: {},
          },
          true,
        );
      }

      if (request.body.method === 'tools/call' && request.body.params) {
        return wrapJsonRpcResponse(
          request.body.id,
          await this.handleToolCall(request, workspace.id),
        );
      }

      if (request.body.method === 'tools/list') {
        return this.listTools(request, workspace.id);
      }

      if (request.body.method === 'prompts/list') {
        return wrapJsonRpcResponse(request.body.id, {
          result: {
            capabilities: {
              prompts: { listChanged: false },
            },
            prompts: [],
          },
        });
      }

      if (request.body.method === 'resources/list') {
        return wrapJsonRpcResponse(request.body.id, {
          result: {
            capabilities: {
              resources: { listChanged: false },
            },
            resources: [],
          },
        });
      }

      return wrapJsonRpcResponse(request.body.id ?? crypto.randomUUID(), {
        result: {},
      });
    } catch (error) {
      return wrapJsonRpcResponse(request.body.id ?? crypto.randomUUID(), {
        error: {
          code: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
          message:
            error.response?.messages?.join?.('\n') || 'Failed to execute tool',
        },
      });
    }
  }
}
