import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { type ZodObject, type ZodRawShape } from 'zod';

import {
  type ToolProvider,
  type ToolProviderContext,
} from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';

import { ToolCategory } from 'src/engine/core-modules/tool-provider/enums/tool-category.enum';
import { CodeInterpreterTool } from 'src/engine/core-modules/tool/tools/code-interpreter-tool/code-interpreter-tool';
import { HttpTool } from 'src/engine/core-modules/tool/tools/http-tool/http-tool';
import { SearchHelpCenterTool } from 'src/engine/core-modules/tool/tools/search-help-center-tool/search-help-center-tool';
import { SendEmailTool } from 'src/engine/core-modules/tool/tools/send-email-tool/send-email-tool';
import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import {
  type Tool,
  type ToolExecutionContext,
} from 'src/engine/core-modules/tool/types/tool.type';
import {
  stripLoadingMessage,
  wrapSchemaForExecution,
} from 'src/engine/core-modules/tool/utils/wrap-tool-for-execution.util';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

@Injectable()
export class ActionToolProvider implements ToolProvider {
  readonly category = ToolCategory.ACTION;

  constructor(
    private readonly httpTool: HttpTool,
    private readonly sendEmailTool: SendEmailTool,
    private readonly searchHelpCenterTool: SearchHelpCenterTool,
    private readonly codeInterpreterTool: CodeInterpreterTool,
    private readonly permissionsService: PermissionsService,
  ) {}

  async isAvailable(_context: ToolProviderContext): Promise<boolean> {
    // Action tools are always available (individual tool permissions checked in generateTools)
    return true;
  }

  async generateTools(context: ToolProviderContext): Promise<ToolSet> {
    const tools: ToolSet = {};

    const executionContext: ToolExecutionContext = {
      workspaceId: context.workspaceId,
      userId: context.userId,
      userWorkspaceId: context.userWorkspaceId,
      onCodeExecutionUpdate: context.onCodeExecutionUpdate,
    };

    const hasHttpPermission = await this.permissionsService.hasToolPermission(
      context.rolePermissionConfig,
      context.workspaceId,
      PermissionFlagType.HTTP_REQUEST_TOOL,
    );

    if (hasHttpPermission) {
      tools['http_request'] = this.createToolEntry(
        this.httpTool,
        executionContext,
      );
    }

    const hasEmailPermission = await this.permissionsService.hasToolPermission(
      context.rolePermissionConfig,
      context.workspaceId,
      PermissionFlagType.SEND_EMAIL_TOOL,
    );

    if (hasEmailPermission) {
      tools['send_email'] = this.createToolEntry(
        this.sendEmailTool,
        executionContext,
      );
    }

    tools['search_help_center'] = this.createToolEntry(
      this.searchHelpCenterTool,
      executionContext,
    );

    const hasCodeInterpreterPermission =
      await this.permissionsService.hasToolPermission(
        context.rolePermissionConfig,
        context.workspaceId,
        PermissionFlagType.CODE_INTERPRETER_TOOL,
      );

    if (hasCodeInterpreterPermission) {
      tools['code_interpreter'] = this.createToolEntry(
        this.codeInterpreterTool,
        executionContext,
      );
    }

    return tools;
  }

  private createToolEntry(tool: Tool, context: ToolExecutionContext) {
    return {
      description: tool.description,
      inputSchema: wrapSchemaForExecution(
        tool.inputSchema as ZodObject<ZodRawShape>,
      ),
      execute: async (parameters: ToolInput) =>
        tool.execute(stripLoadingMessage(parameters), context),
    };
  }
}
