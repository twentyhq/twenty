import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import {
  type ToolProvider,
  type ToolProviderContext,
} from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';

import { ToolCategory } from 'src/engine/core-modules/tool-provider/enums/tool-category.enum';
import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';

@Injectable()
export class LogicFunctionToolProvider implements ToolProvider {
  readonly category = ToolCategory.LOGIC_FUNCTION;

  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async isAvailable(_context: ToolProviderContext): Promise<boolean> {
    return true;
  }

  async generateDescriptors(
    context: ToolProviderContext,
  ): Promise<ToolDescriptor[]> {
    const { flatLogicFunctionMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId: context.workspaceId,
          flatMapsKeys: ['flatLogicFunctionMaps'],
        },
      );

    const logicFunctionsWithSchema = Object.values(
      flatLogicFunctionMaps.byUniversalIdentifier,
    ).filter(
      (fn): fn is FlatLogicFunction =>
        isDefined(fn) && fn.isTool === true && fn.deletedAt === null,
    );

    const descriptors: ToolDescriptor[] = [];

    for (const logicFunction of logicFunctionsWithSchema) {
      const toolName = this.buildLogicFunctionToolName(logicFunction.name);

      // Logic functions already store JSON Schema -- use it directly
      const inputSchema = (logicFunction.toolInputSchema as object) ?? {
        type: 'object',
        properties: {},
      };

      descriptors.push({
        name: toolName,
        description:
          logicFunction.description ||
          `Execute the ${logicFunction.name} logic function`,
        category: ToolCategory.LOGIC_FUNCTION,
        inputSchema,
        executionRef: {
          kind: 'logic_function',
          logicFunctionId: logicFunction.id,
        },
      });
    }

    return descriptors;
  }

  private buildLogicFunctionToolName(functionName: string): string {
    return `logic_function_${functionName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')}`;
  }
}
