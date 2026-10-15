import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import {
  buildToolInputJsonSchema,
  DEFAULT_TOOL_INPUT_SCHEMA,
} from 'twenty-shared/logic-function';

import { ApplicationReachService } from 'src/engine/core-modules/authorization/application-reach/services/application-reach.service';
import { type OperationPolicy } from 'src/engine/core-modules/authorization/types/operation-policy.type';
import { type GenerateDescriptorOptions } from 'src/engine/core-modules/tool-provider/interfaces/generate-descriptor-options.type';
import { type ToolProvider } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';

import { ToolCategory } from 'twenty-shared/ai';
import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { LOGIC_FUNCTION_OPERATIONS } from 'src/engine/metadata-modules/logic-function/constants/logic-function-operations.constant';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { buildLogicFunctionToolName } from 'src/engine/core-modules/tool-provider/utils/build-logic-function-tool-name.util';

@Injectable()
export class LogicFunctionToolProvider implements ToolProvider {
  readonly category = ToolCategory.LOGIC_FUNCTION;

  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationReachService: ApplicationReachService,
  ) {}

  async isAvailable(context: ToolProviderContext): Promise<boolean> {
    return isDefined(
      await this.applicationReachService.findCurrentReach(context.workspaceId),
    );
  }

  getToolPolicy(_toolName: string): OperationPolicy {
    return LOGIC_FUNCTION_OPERATIONS.executeAsTool;
  }

  // Unreachable: logic function descriptors are dispatched inline by ToolExecutorService.
  async executeStaticTool(
    toolName: string,
    _args: Record<string, unknown>,
    _context: ToolProviderContext,
  ): Promise<ToolOutput> {
    throw new Error(
      `LogicFunctionToolProvider does not emit static-kind descriptors (tool: ${toolName})`,
    );
  }

  async generateDescriptors(
    context: ToolProviderContext,
    options?: GenerateDescriptorOptions,
  ): Promise<(ToolIndexEntry | ToolDescriptor)[]> {
    const includeSchemas = options?.includeSchemas ?? true;

    const [
      { flatObjectMetadataMaps, flatFrontComponentMaps },
      flatLogicFunctionMaps,
    ] = await Promise.all([
      this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps({
        workspaceId: context.workspaceId,
        flatMapsKeys: ['flatObjectMetadataMaps', 'flatFrontComponentMaps'],
      }),
      this.applicationReachService.getReachableFlatEntityMaps({
        workspaceId: context.workspaceId,
        metadataName: 'logicFunction',
        access: 'trigger',
      }),
    ]);

    const resolveWidgetFrontComponentId = (
      frontComponentUniversalIdentifier: string | undefined,
    ) =>
      isDefined(frontComponentUniversalIdentifier)
        ? flatFrontComponentMaps.byUniversalIdentifier[
            frontComponentUniversalIdentifier
          ]?.id
        : undefined;

    const resolveObjectLabel = (objectUniversalIdentifier: string) =>
      flatObjectMetadataMaps.byUniversalIdentifier[objectUniversalIdentifier]
        ?.labelSingular;

    const logicFunctionsWithSchema = Object.values(
      flatLogicFunctionMaps.byUniversalIdentifier,
    ).filter(
      (fn): fn is FlatLogicFunction =>
        isDefined(fn) &&
        isDefined(fn.toolTriggerSettings) &&
        fn.deletedAt === null,
    );

    const descriptors: (ToolIndexEntry | ToolDescriptor)[] = [];

    for (const logicFunction of logicFunctionsWithSchema) {
      const toolName = buildLogicFunctionToolName(logicFunction.name);

      const base: ToolIndexEntry = {
        name: toolName,
        label: logicFunction.name,
        description:
          logicFunction.description ||
          `Execute the ${logicFunction.name} logic function`,
        category: ToolCategory.LOGIC_FUNCTION,
        executionRef: {
          kind: 'logic_function',
          logicFunctionId: logicFunction.id,
        },
        frontComponentId: resolveWidgetFrontComponentId(
          logicFunction.toolTriggerSettings?.frontComponentUniversalIdentifier,
        ),
      };

      if (includeSchemas) {
        descriptors.push({
          ...base,
          inputSchema: isDefined(logicFunction.toolTriggerSettings?.inputSchema)
            ? (buildToolInputJsonSchema(
                logicFunction.toolTriggerSettings.inputSchema,
                resolveObjectLabel,
              ) as object)
            : DEFAULT_TOOL_INPUT_SCHEMA,
        });
      } else {
        descriptors.push(base);
      }
    }

    return descriptors;
  }
}
