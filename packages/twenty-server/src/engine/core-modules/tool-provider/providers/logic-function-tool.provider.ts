import { Injectable } from '@nestjs/common';

import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import {
  buildToolInputJsonSchema,
  DEFAULT_TOOL_INPUT_SCHEMA,
} from 'twenty-shared/logic-function';

import { canCallerReachApplication } from 'src/engine/core-modules/application/utils/can-caller-reach-application.util';
import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { translateStandardLabel } from 'src/engine/core-modules/i18n/utils/translate-standard-label.util';
import { type GenerateDescriptorOptions } from 'src/engine/core-modules/tool-provider/interfaces/generate-descriptor-options.type';
import { type ToolProvider } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';

import { ToolCategory } from 'twenty-shared/ai';
import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { ApplicationTranslationCatalogService } from 'src/engine/metadata-modules/application-translation-catalog/services/application-translation-catalog.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { buildLogicFunctionToolApproval } from 'src/engine/core-modules/tool-provider/utils/build-logic-function-tool-approval.util';
import { buildLogicFunctionToolName } from 'src/engine/core-modules/tool-provider/utils/build-logic-function-tool-name.util';

@Injectable()
export class LogicFunctionToolProvider implements ToolProvider {
  readonly category = ToolCategory.LOGIC_FUNCTION;

  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly applicationTranslationCatalogService: ApplicationTranslationCatalogService,
    private readonly i18nService: I18nService,
  ) {}

  async isAvailable(_context: ToolProviderContext): Promise<boolean> {
    return true;
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

    const {
      flatLogicFunctionMaps,
      flatObjectMetadataMaps,
      flatFrontComponentMaps,
    } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId: context.workspaceId,
          flatMapsKeys: [
            'flatLogicFunctionMaps',
            'flatObjectMetadataMaps',
            'flatFrontComponentMaps',
          ],
        },
      );

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
        fn.deletedAt === null &&
        canCallerReachApplication({
          callingApplication: context.application,
          applicationId: fn.applicationId,
          operation: 'trigger',
          workspaceCustomApplicationId:
            context.authContext?.workspace.workspaceCustomApplicationId,
        }),
    );

    const translateApprovalLabel = await this.buildApprovalLabelTranslator({
      context,
      logicFunctions: logicFunctionsWithSchema,
    });

    const descriptors: (ToolIndexEntry | ToolDescriptor)[] = [];

    for (const logicFunction of logicFunctionsWithSchema) {
      const toolName = buildLogicFunctionToolName(logicFunction.name);
      const approval = buildLogicFunctionToolApproval({
        approvalSettings: logicFunction.toolTriggerSettings?.approval,
        translateLabel: (label) =>
          translateApprovalLabel({
            ...label,
            applicationId: logicFunction.applicationId,
          }),
      });

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
        ...(isDefined(approval) && { approval }),
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

  private async buildApprovalLabelTranslator({
    context,
    logicFunctions,
  }: {
    context: Pick<ToolProviderContext, 'locale' | 'workspaceId'>;
    logicFunctions: FlatLogicFunction[];
  }): Promise<
    (label: {
      message: string;
      context: string;
      applicationId: string;
    }) => string
  > {
    const { locale } = context;
    const applicationIds = [
      ...new Set(
        logicFunctions
          .filter((logicFunction) =>
            isDefined(logicFunction.toolTriggerSettings?.approval),
          )
          .map((logicFunction) => logicFunction.applicationId),
      ),
    ];

    if (
      !isDefined(locale) ||
      locale === SOURCE_LOCALE ||
      !isNonEmptyArray(applicationIds)
    ) {
      return ({ message }) => message;
    }

    const { catalogByApplicationId } =
      await this.applicationTranslationCatalogService.getCatalogs({
        applicationIds,
        locale,
        workspaceId: context.workspaceId,
      });
    const i18nInstance = this.i18nService.getI18nInstance(locale);

    return ({ message, context: messageContext, applicationId }) =>
      translateStandardLabel({
        sourceValue: message,
        context: messageContext,
        applicationCatalog: catalogByApplicationId.get(applicationId),
        i18nInstance,
      });
  }
}
