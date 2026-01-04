import { Injectable } from '@nestjs/common';

import { jsonSchema, type ToolSet } from 'ai';
import { isDefined } from 'twenty-shared/utils';

import {
  type ToolProvider,
  type ToolProviderContext,
} from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';

import { ToolCategory } from 'src/engine/core-modules/tool-provider/enums/tool-category.enum';
import { wrapJsonSchemaForExecution } from 'src/engine/core-modules/tool/utils/wrap-tool-for-execution.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { ServerlessFunctionService } from 'src/engine/metadata-modules/serverless-function/serverless-function.service';
import { type FlatServerlessFunction } from 'src/engine/metadata-modules/serverless-function/types/flat-serverless-function.type';

@Injectable()
export class ServerlessFunctionToolProvider implements ToolProvider {
  readonly category = ToolCategory.SERVERLESS_FUNCTION;

  constructor(
    private readonly serverlessFunctionService: ServerlessFunctionService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async isAvailable(_context: ToolProviderContext): Promise<boolean> {
    // Serverless function tools are available if there are any functions marked as tools
    return true;
  }

  async generateTools(context: ToolProviderContext): Promise<ToolSet> {
    const { flatServerlessFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId: context.workspaceId,
          flatMapsKeys: ['flatServerlessFunctionMaps'],
        },
      );

    // Filter serverless functions that are marked as tools
    const serverlessFunctionsWithSchema = Object.values(
      flatServerlessFunctionMaps.byId,
    ).filter(
      (fn): fn is FlatServerlessFunction =>
        isDefined(fn) && fn.isTool === true && fn.deletedAt === null,
    );

    const tools: ToolSet = {};

    for (const serverlessFunction of serverlessFunctionsWithSchema) {
      const toolName = this.buildServerlessFunctionToolName(
        serverlessFunction.name,
      );

      const wrappedSchema = wrapJsonSchemaForExecution(
        serverlessFunction.toolInputSchema as Record<string, unknown>,
      );

      tools[toolName] = {
        description:
          serverlessFunction.description ||
          `Execute the ${serverlessFunction.name} serverless function`,
        inputSchema: jsonSchema(wrappedSchema),
        execute: async (parameters: Record<string, unknown>) => {
          const { loadingMessage: _, ...actualParams } = parameters;

          const result =
            await this.serverlessFunctionService.executeOneServerlessFunction({
              id: serverlessFunction.id,
              workspaceId: context.workspaceId,
              payload: actualParams,
              version: serverlessFunction.latestVersion ?? 'draft',
            });

          if (result.error) {
            return {
              success: false,
              error: result.error.errorMessage,
            };
          }

          return {
            success: true,
            result: result.data,
          };
        },
      };
    }

    return tools;
  }

  private buildServerlessFunctionToolName(functionName: string): string {
    // Convert function name to a valid tool name (lowercase, underscores)
    return `serverless_${functionName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')}`;
  }
}
