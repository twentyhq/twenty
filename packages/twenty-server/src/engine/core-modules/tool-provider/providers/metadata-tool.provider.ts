import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { FeatureFlagKey } from 'twenty-shared/types';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { type GenerateDescriptorOptions } from 'src/engine/core-modules/tool-provider/interfaces/generate-descriptor-options.type';
import { type ToolProvider } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';

import { ToolCategory } from 'twenty-shared/ai';
import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { executeToolFromToolSet } from 'src/engine/core-modules/tool-provider/utils/execute-tool-from-tool-set.util';
import { toolSetToDescriptors } from 'src/engine/core-modules/tool-provider/utils/tool-set-to-descriptors.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { FieldMetadataToolsFactory } from 'src/engine/metadata-modules/field-metadata/tools/field-metadata-tools.factory';
import { ObjectMetadataToolsFactory } from 'src/engine/metadata-modules/object-metadata/tools/object-metadata-tools.factory';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { ValidationRuleToolsFactory } from 'src/engine/metadata-modules/validation-rule/tools/validation-rule-tools.factory';

@Injectable()
export class MetadataToolProvider implements ToolProvider {
  readonly category = ToolCategory.METADATA;

  constructor(
    private readonly objectMetadataToolsFactory: ObjectMetadataToolsFactory,
    private readonly fieldMetadataToolsFactory: FieldMetadataToolsFactory,
    private readonly validationRuleToolsFactory: ValidationRuleToolsFactory,
    private readonly permissionsService: PermissionsService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  async isAvailable(context: ToolProviderContext): Promise<boolean> {
    return this.permissionsService.checkRolesPermissions(
      context.rolePermissionConfig,
      context.workspaceId,
      PermissionFlagType.DATA_MODEL,
    );
  }

  async generateDescriptors(
    context: ToolProviderContext,
    options?: GenerateDescriptorOptions,
  ): Promise<(ToolIndexEntry | ToolDescriptor)[]> {
    const toolSet = await this.buildToolSet(context);

    return toolSetToDescriptors(toolSet, ToolCategory.METADATA, {
      includeSchemas: options?.includeSchemas ?? true,
      icon: 'IconSettings',
    });
  }

  async executeStaticTool(
    toolName: string,
    args: Record<string, unknown>,
    context: ToolProviderContext,
  ): Promise<ToolOutput> {
    const toolSet = await this.buildToolSet(context);

    return executeToolFromToolSet(
      toolSet,
      toolName,
      args,
      ToolCategory.METADATA,
    );
  }

  private async buildToolSet(context: ToolProviderContext): Promise<ToolSet> {
    const isValidationRulesEnabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_VALIDATION_RULES_ENABLED,
        context.workspaceId,
      );

    return {
      ...this.objectMetadataToolsFactory.generateTools(context.workspaceId),
      ...this.fieldMetadataToolsFactory.generateTools(context.workspaceId),
      ...(isValidationRulesEnabled
        ? this.validationRuleToolsFactory.generateTools(context.workspaceId)
        : {}),
    };
  }
}
