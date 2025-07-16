import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { Request } from 'express';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import { JSONSchema7 } from 'json-schema';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { wrapJsonRpcResponse } from 'src/engine/core-modules/ai/utils/wrap-jsonrpc-response.util';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { CreateToolsService } from 'src/engine/api/mcp/services/tools/create.tools.service';
import { UpdateToolsService } from 'src/engine/api/mcp/services/tools/update.tools.service';
import { DeleteToolsService } from 'src/engine/api/mcp/services/tools/delete.tools.service';
import { GetToolsService } from 'src/engine/api/mcp/services/tools/get.tools.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';

@Injectable()
export class MCPMetadataService {
  schemas: Record<string, JSONSchema7>;

  constructor(
    private readonly featureFlagService: FeatureFlagService,
    private readonly createToolsService: CreateToolsService,
    private readonly updateToolsService: UpdateToolsService,
    private readonly deleteToolsService: DeleteToolsService,
    private readonly getToolsService: GetToolsService,
    private readonly metricsService: MetricsService,
  ) {}

  async onModuleInit() {
    this.schemas = validationMetadatasToSchemas() as Record<
      string,
      JSONSchema7
    >;
  }

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

  handleInitialize(requestId: string | number | null) {
    return wrapJsonRpcResponse(requestId, {
      result: {
        capabilities: {
          tools: { listChanged: false },
          resources: { listChanged: false },
          prompts: { listChanged: false },
        },
      },
    });
  }

  get commonProperties() {
    return {
      fields: {
        type: 'array',
        items: {
          type: 'string',
          description:
            'Names of field properties to include in the response for field entities. ',
          examples: [
            'type',
            'name',
            'label',
            'description',
            'icon',
            'isCustom',
            'isActive',
            'isSystem',
            'isNullable',
            'createdAt',
            'updatedAt',
            'defaultValue',
            'options',
            'relation',
          ],
        },
        description:
          'List of field names to select in the query for field entity. Strongly recommended to limit token usage and reduce response size. Use this to include only the properties you need.',
      },
      objects: {
        type: 'array',
        items: {
          type: 'string',
          description:
            'Object property names to include in the response for object entities.',
          examples: [
            'dataSourceId',
            'nameSingular',
            'namePlural',
            'labelSingular',
            'labelPlural',
            'description',
            'icon',
            'isCustom',
            'isActive',
            'isSystem',
            'createdAt',
            'updatedAt',
            'labelIdentifierFieldMetadataId',
            'imageIdentifierFieldMetadataId',
          ],
        },
        description:
          'List of object properties to select in the query for object entities. Strongly recommended to limit token usage and reduce response size. Specify only the necessary properties to optimize your request.',
      },
    };
  }

  get tools() {
    return [
      ...this.createToolsService.tools,
      ...this.updateToolsService.tools,
      ...this.deleteToolsService.tools,
      ...this.getToolsService.tools,
    ];
  }

  async handleToolCall(
    request: Request,
  ): Promise<Parameters<typeof wrapJsonRpcResponse>[1]> {
    const tool = this.tools.find(
      ({ name }) => name === request.body.params.name,
    );

    if (tool) {
      try {
        const result = await tool.execute(request);

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
      }
    }

    return {
      error: {
        code: HttpStatus.NOT_FOUND,
        message: `Tool ${request.body.params.name} not found`,
      },
    };
  }

  async listTools(request: Request) {
    return wrapJsonRpcResponse(request.body.id, {
      result: {
        capabilities: {
          tools: { listChanged: false },
        },
        commonProperties: this.commonProperties,
        tools: Object.values(this.tools),
      },
    });
  }

  async handleMCPQuery(
    request: Request,
    {
      workspace,
    }: { workspace: Workspace; userWorkspaceId?: string; apiKey?: string },
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
          await this.handleToolCall(request),
        );
      }

      return this.listTools(request);
    } catch (error) {
      return wrapJsonRpcResponse(request.body.id, {
        error: {
          code: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
          message:
            error.response?.messages?.join?.('\n') || 'Failed to execute tool',
        },
      });
    }
  }
}
