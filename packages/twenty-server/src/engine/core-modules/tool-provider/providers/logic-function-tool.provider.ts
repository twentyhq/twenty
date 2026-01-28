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
import { LogicFunctionService } from 'src/engine/metadata-modules/logic-function/logic-function.service';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

@Injectable()
export class LogicFunctionToolProvider implements ToolProvider {
  readonly category = ToolCategory.LOGIC_FUNCTION;

  constructor(
    private readonly logicFunctionService: LogicFunctionService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async isAvailable(_context: ToolProviderContext): Promise<boolean> {
    // Logic function tools are available if there are any functions marked as tools
    return true;
  }

  async generateTools(context: ToolProviderContext): Promise<ToolSet> {
    const { flatLogicFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId: context.workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        },
      );

    // Filter logic functions that are marked as tools
    const logicFunctionsWithSchema = Object.values(
      flatLogicFunctionMaps.byId,
    ).filter(
      (fn): fn is FlatLogicFunction =>
        isDefined(fn) && fn.isTool === true && fn.deletedAt === null,
    );

    const tools: ToolSet = {};

    for (const logicFunction of logicFunctionsWithSchema) {
      const toolName = this.buildLogicFunctionToolName(logicFunction.name);

      const wrappedSchema = wrapJsonSchemaForExecution(
        logicFunction.toolInputSchema as Record<string, unknown>,
      );

      tools[toolName] = {
        description:
          logicFunction.description ||
          `Execute the ${logicFunction.name} logic function`,
        inputSchema: jsonSchema(wrappedSchema),
        execute: async (parameters: Record<string, unknown>) => {
          const { loadingMessage: _, ...actualParams } = parameters;

          const result =
            await this.logicFunctionService.executeOneLogicFunction({
              id: logicFunction.id,
              workspaceId: context.workspaceId,
              payload: actualParams,
              version: logicFunction.latestVersion ?? 'draft',
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

  private buildLogicFunctionToolName(functionName: string): string {
    // Convert function name to a valid tool name (lowercase, underscores)
    return `logic_function_${functionName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')}`;
  }
}
