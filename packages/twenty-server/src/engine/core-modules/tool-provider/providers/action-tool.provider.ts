import { Injectable } from '@nestjs/common';

import { PermissionFlagType } from 'twenty-shared/constants';
import { z } from 'zod';

import {
  type ToolProvider,
  type ToolProviderContext,
} from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';

import { ToolCategory } from 'src/engine/core-modules/tool-provider/enums/tool-category.enum';
import {
  type StaticToolHandler,
  ToolExecutorService,
} from 'src/engine/core-modules/tool-provider/services/tool-executor.service';
import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { CodeInterpreterTool } from 'src/engine/core-modules/tool/tools/code-interpreter-tool/code-interpreter-tool';
import { HttpTool } from 'src/engine/core-modules/tool/tools/http-tool/http-tool';
import { SearchHelpCenterTool } from 'src/engine/core-modules/tool/tools/search-help-center-tool/search-help-center-tool';
import { SendEmailTool } from 'src/engine/core-modules/tool/tools/send-email-tool/send-email-tool';
import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

@Injectable()
export class ActionToolProvider implements ToolProvider {
  readonly category = ToolCategory.ACTION;

  private readonly toolMap: Map<string, Tool>;

  constructor(
    private readonly httpTool: HttpTool,
    private readonly sendEmailTool: SendEmailTool,
    private readonly searchHelpCenterTool: SearchHelpCenterTool,
    private readonly codeInterpreterTool: CodeInterpreterTool,
    private readonly permissionsService: PermissionsService,
    private readonly toolExecutorService: ToolExecutorService,
  ) {
    this.toolMap = new Map<string, Tool>([
      ['http_request', this.httpTool],
      ['send_email', this.sendEmailTool],
      ['search_help_center', this.searchHelpCenterTool],
      ['code_interpreter', this.codeInterpreterTool],
    ]);

    // Register each action tool as a static handler in the executor
    for (const [toolId, tool] of this.toolMap) {
      const handler: StaticToolHandler = {
        execute: async (args: ToolInput, context: ToolProviderContext) =>
          tool.execute(args, {
            workspaceId: context.workspaceId,
            userId: context.userId,
            userWorkspaceId: context.userWorkspaceId,
            onCodeExecutionUpdate: context.onCodeExecutionUpdate,
          }),
      };

      this.toolExecutorService.registerStaticHandler(toolId, handler);
    }
  }

  async isAvailable(_context: ToolProviderContext): Promise<boolean> {
    return true;
  }

  async generateDescriptors(
    context: ToolProviderContext,
  ): Promise<ToolDescriptor[]> {
    const descriptors: ToolDescriptor[] = [];

    const hasHttpPermission = await this.permissionsService.hasToolPermission(
      context.rolePermissionConfig,
      context.workspaceId,
      PermissionFlagType.HTTP_REQUEST_TOOL,
    );

    if (hasHttpPermission) {
      descriptors.push(this.buildDescriptor('http_request', this.httpTool));
    }

    const hasEmailPermission = await this.permissionsService.hasToolPermission(
      context.rolePermissionConfig,
      context.workspaceId,
      PermissionFlagType.SEND_EMAIL_TOOL,
    );

    if (hasEmailPermission) {
      descriptors.push(this.buildDescriptor('send_email', this.sendEmailTool));
    }

    descriptors.push(
      this.buildDescriptor('search_help_center', this.searchHelpCenterTool),
    );

    const hasCodeInterpreterPermission =
      await this.permissionsService.hasToolPermission(
        context.rolePermissionConfig,
        context.workspaceId,
        PermissionFlagType.CODE_INTERPRETER_TOOL,
      );

    if (hasCodeInterpreterPermission) {
      descriptors.push(
        this.buildDescriptor('code_interpreter', this.codeInterpreterTool),
      );
    }

    return descriptors;
  }

  private buildDescriptor(toolId: string, tool: Tool): ToolDescriptor {
    return {
      name: toolId,
      description: tool.description,
      category: ToolCategory.ACTION,
      inputSchema: z.toJSONSchema(tool.inputSchema as z.ZodType),
      executionRef: { kind: 'static', toolId },
    };
  }
}
