import { Injectable } from '@nestjs/common';

import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';

import { type ToolProvider } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

@Injectable()
export class WebhookToolProvider implements ToolProvider {
  readonly category = ToolCategory.WEBHOOK;

  constructor(private readonly permissionsService: PermissionsService) {}

  async isAvailable(context: ToolProviderContext): Promise<boolean> {
    return this.permissionsService.checkRolesPermissions(
      context.rolePermissionConfig,
      context.workspaceId,
      PermissionFlagType.API_KEYS_AND_WEBHOOKS,
    );
  }

  // Webhook tools are @DefineTool classes, listed and run by the registry under this category
  async generateDescriptors(): Promise<(ToolIndexEntry | ToolDescriptor)[]> {
    return [];
  }

  async executeStaticTool(toolName: string): Promise<ToolOutput> {
    throw new Error(
      `WebhookToolProvider does not emit static-kind descriptors (tool: ${toolName})`,
    );
  }
}
