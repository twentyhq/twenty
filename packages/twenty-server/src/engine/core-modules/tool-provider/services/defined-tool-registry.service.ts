import { Injectable, type OnModuleInit } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';

import { type ToolCategory } from 'twenty-shared/ai';
import { type PermissionFlagType } from 'twenty-shared/constants';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { DEFINE_TOOL_METADATA_KEY } from 'src/engine/core-modules/tool-provider/constants/define-tool-metadata-key.constant';
import { BaseTool } from 'src/engine/core-modules/tool-provider/interfaces/base-tool.interface';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type DefineToolOptions } from 'src/engine/core-modules/tool-provider/types/define-tool-options.type';
import { type DefinedTool } from 'src/engine/core-modules/tool-provider/types/defined-tool.type';
import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { buildInvalidToolArgumentsOutput } from 'src/engine/core-modules/tool-provider/utils/build-invalid-tool-arguments-output.util';
import { buildToolInputJsonSchemaOrThrow } from 'src/engine/core-modules/tool-provider/utils/build-tool-input-json-schema-or-throw.util';
import { buildToolNotAvailableOutput } from 'src/engine/core-modules/tool-provider/utils/build-tool-not-available-output.util';
import { isSnakeCaseToolName } from 'src/engine/core-modules/tool-provider/utils/is-snake-case-tool-name.util';
import { humanizeToolName } from 'src/engine/core-modules/tool-provider/utils/tool-set-to-descriptors.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

// Shared by the tools of one listing, so each permission and the workspace feature flags are read once
type ToolAvailabilityCache = {
  grantedByPermissionFlag: Map<PermissionFlagType, Promise<boolean>>;
  getFeatureFlagsMap: () => Promise<FeatureFlagMap>;
};

@Injectable()
export class DefinedToolRegistryService implements OnModuleInit {
  private readonly definedToolsByName = new Map<string, DefinedTool>();

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly permissionsService: PermissionsService,
    private readonly featureFlagService: FeatureFlagService,
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

    const cache = this.createToolAvailabilityCache(context);

    const isAvailableByTool = await Promise.all(
      requestedTools.map((definedTool) =>
        this.isToolAvailableToCaller({ definedTool, context, cache }),
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

    if (
      !(await this.isToolAvailableToCaller({
        definedTool,
        context,
        cache: this.createToolAvailabilityCache(context),
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

    return tool.execute({ input: parsedInput.data, context });
  }

  private createToolAvailabilityCache(
    context: ToolProviderContext,
  ): ToolAvailabilityCache {
    let featureFlagsMap: Promise<FeatureFlagMap> | undefined;

    return {
      grantedByPermissionFlag: new Map(),
      getFeatureFlagsMap: () =>
        (featureFlagsMap ??=
          this.featureFlagService.getWorkspaceFeatureFlagsMap(
            context.workspaceId,
          )),
    };
  }

  private async isToolAvailableToCaller({
    definedTool: {
      options: { requiredPermissionFlags, requiredFeatureFlags },
    },
    context,
    cache,
  }: {
    definedTool: DefinedTool;
    context: ToolProviderContext;
    cache: ToolAvailabilityCache;
  }): Promise<boolean> {
    if (isNonEmptyArray(requiredFeatureFlags)) {
      const featureFlagsMap = await cache.getFeatureFlagsMap();

      if (
        !requiredFeatureFlags.every(
          (featureFlag) => featureFlagsMap[featureFlag] === true,
        )
      ) {
        return false;
      }
    }

    const grants = await Promise.all(
      requiredPermissionFlags.map((permissionFlag) => {
        const cachedGrant = cache.grantedByPermissionFlag.get(permissionFlag);

        if (isDefined(cachedGrant)) {
          return cachedGrant;
        }

        const grant = this.permissionsService.checkRolesPermissions(
          context.rolePermissionConfig,
          context.workspaceId,
          permissionFlag,
        );

        cache.grantedByPermissionFlag.set(permissionFlag, grant);

        return grant;
      }),
    );

    return grants.every((isGranted) => isGranted);
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
