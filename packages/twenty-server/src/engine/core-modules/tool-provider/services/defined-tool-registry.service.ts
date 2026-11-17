import { Injectable, type OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { isString } from '@sniptt/guards';
import { type ToolCategory } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { findApplicationOwnedFlatEntity } from 'src/engine/core-modules/application/utils/find-application-owned-flat-entity.util';
import { getScopedCallingApplication } from 'src/engine/core-modules/application/utils/get-scoped-calling-application.util';
import { isApplicationOwnedEntityReachable } from 'src/engine/core-modules/application/utils/is-application-owned-entity-reachable.util';
import { readValueAtPath } from 'src/engine/core-modules/application/utils/read-value-at-path.util';
import { getAuthContextApplication } from 'src/engine/core-modules/auth/utils/get-auth-context-application.util';
import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { DEFINE_TOOL_METADATA_KEY } from 'src/engine/core-modules/tool-provider/constants/define-tool-metadata-key.constant';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type DefineToolOptions } from 'src/engine/core-modules/tool-provider/types/define-tool-options.type';
import { type DefinedTool } from 'src/engine/core-modules/tool-provider/types/defined-tool.type';
import { type ToolApplicationTarget } from 'src/engine/core-modules/tool-provider/types/tool-application-target.type';
import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { buildApplicationTargetNotReachableOutput } from 'src/engine/core-modules/tool-provider/utils/build-application-target-not-reachable-output.util';
import { buildInvalidToolArgumentsOutput } from 'src/engine/core-modules/tool-provider/utils/build-invalid-tool-arguments-output.util';
import { buildToolInputJsonSchemaOrThrow } from 'src/engine/core-modules/tool-provider/utils/build-tool-input-json-schema-or-throw.util';
import { buildToolNotAvailableOutput } from 'src/engine/core-modules/tool-provider/utils/build-tool-not-available-output.util';
import { isSnakeCaseToolName } from 'src/engine/core-modules/tool-provider/utils/is-snake-case-tool-name.util';
import { humanizeToolName } from 'src/engine/core-modules/tool-provider/utils/tool-set-to-descriptors.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { AccessPolicyService } from 'src/engine/guards/access-policy/access-policy.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';

@Injectable()
export class DefinedToolRegistryService implements OnModuleInit {
  private readonly definedToolsByName = new Map<string, DefinedTool>();

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly accessPolicyService: AccessPolicyService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  onModuleInit() {
    for (const { instance, metatype } of this.discoveryService.getProviders()) {
      if (!isDefined(metatype)) {
        continue;
      }

      const options: DefineToolOptions | undefined = Reflect.getMetadata(
        DEFINE_TOOL_METADATA_KEY,
        metatype,
      );

      if (isDefined(options)) {
        this.register(options, instance);
      }
    }
  }

  findDefinedTool(toolName: string): DefinedTool | undefined {
    return this.definedToolsByName.get(toolName);
  }

  async getAvailableDescriptors(
    context: ToolProviderContext,
    {
      categories,
      includeSchemas,
    }: { categories?: ToolCategory[]; includeSchemas: boolean },
  ): Promise<(ToolIndexEntry | ToolDescriptor)[]> {
    const requestedTools = [...this.definedToolsByName.values()].filter(
      ({ options }) =>
        !isDefined(categories) || categories.includes(options.category),
    );

    const featureFlagsMap =
      await this.featureFlagService.getWorkspaceFeatureFlagsMap(
        context.workspaceId,
      );

    const isAvailableByTool = await Promise.all(
      requestedTools.map((definedTool) =>
        this.isToolAvailableToCaller({
          definedTool,
          context,
          featureFlagsMap,
        }),
      ),
    );

    return requestedTools
      .filter((_, index) => isAvailableByTool[index])
      .map(
        ({
          options: { name, description, category, icon },
          inputJsonSchema,
        }) => {
          const entry: ToolIndexEntry = {
            name,
            label: humanizeToolName(name),
            description,
            category,
            executionRef: { kind: 'static', toolId: name },
            ...(isDefined(icon) && { icon }),
          };

          return includeSchemas
            ? { ...entry, inputSchema: inputJsonSchema }
            : entry;
        },
      );
  }

  async execute({
    definedTool,
    args,
    context,
  }: {
    definedTool: DefinedTool;
    args: Record<string, unknown>;
    context: ToolProviderContext;
  }): Promise<ToolOutput> {
    const { options, tool } = definedTool;

    const featureFlagsMap =
      await this.featureFlagService.getWorkspaceFeatureFlagsMap(
        context.workspaceId,
      );

    if (
      !(await this.isToolAvailableToCaller({
        definedTool,
        context,
        featureFlagsMap,
      }))
    ) {
      return buildToolNotAvailableOutput(options.name);
    }

    const parsedInput = await tool.inputSchema.safeParseAsync(args);

    if (!parsedInput.success) {
      return buildInvalidToolArgumentsOutput({
        toolName: options.name,
        error: parsedInput.error,
      });
    }

    if (
      isDefined(options.applicationTarget) &&
      !(await this.isApplicationTargetReachable({
        input: parsedInput.data,
        context,
        ...options.applicationTarget,
      }))
    ) {
      return buildApplicationTargetNotReachableOutput({
        toolName: options.name,
        applicationTarget: options.applicationTarget,
      });
    }

    return tool.execute({ input: parsedInput.data, context });
  }

  // Reads the caller from the auth context, the same one the access policy classified
  private async isApplicationTargetReachable({
    input,
    context,
    metadataName,
    idKey,
  }: ToolApplicationTarget & {
    input: unknown;
    context: ToolProviderContext;
  }): Promise<boolean> {
    const callingApplication = getScopedCallingApplication(
      getAuthContextApplication(context.authContext),
    );

    if (!isDefined(callingApplication)) {
      return true;
    }

    const entityId = readValueAtPath(input, idKey);

    if (!isString(entityId)) {
      return false;
    }

    const flatEntity = await findApplicationOwnedFlatEntity({
      flatEntityMapsCacheService: this.flatEntityMapsCacheService,
      metadataName,
      entityId,
      workspaceId: context.workspaceId,
    });

    return isApplicationOwnedEntityReachable({
      flatEntity,
      callingApplication,
    });
  }

  private async isToolAvailableToCaller({
    definedTool: {
      options: { accessPolicy },
    },
    context,
    featureFlagsMap,
  }: {
    definedTool: DefinedTool;
    context: ToolProviderContext;
    featureFlagsMap: FeatureFlagMap;
  }): Promise<boolean> {
    return this.accessPolicyService.isToolAccessPolicySatisfied({
      accessPolicy,
      authContext: context.authContext,
      featureFlagsMap,
    });
  }

  private register(options: DefineToolOptions, instance: unknown): void {
    const { name } = options;

    if (!(instance instanceof BaseTool)) {
      throw new Error(
        `@DefineTool "${name}" must decorate a singleton provider that extends BaseTool`,
      );
    }

    if (!isSnakeCaseToolName(name)) {
      throw new Error(
        `@DefineTool "${name}" must be snake_case, for example "delete_webhook"`,
      );
    }

    if (this.definedToolsByName.has(name)) {
      throw new Error(`@DefineTool "${name}" is declared more than once`);
    }

    const inputJsonSchema = buildToolInputJsonSchemaOrThrow({
      toolName: name,
      inputSchema: instance.inputSchema,
    });

    this.definedToolsByName.set(name, {
      options,
      tool: instance,
      inputJsonSchema,
    });
  }
}
