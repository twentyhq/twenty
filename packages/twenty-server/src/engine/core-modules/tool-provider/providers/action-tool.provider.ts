import { Injectable } from '@nestjs/common';

import { PermissionFlagType } from 'twenty-shared/constants';
import { z } from 'zod';

import { type GenerateDescriptorOptions } from 'src/engine/core-modules/tool-provider/interfaces/generate-descriptor-options.type';
import { type ToolProvider } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';

import { ToolCategory } from 'twenty-shared/ai';
import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { CodeInterpreterService } from 'src/engine/core-modules/code-interpreter/code-interpreter.service';
import { CodeInterpreterTool } from 'src/engine/core-modules/tool/tools/code-interpreter-tool/code-interpreter-tool';
import { DraftEmailTool } from 'src/engine/core-modules/tool/tools/email-tool/draft-email-tool';
import { SendEmailTool } from 'src/engine/core-modules/tool/tools/email-tool/send-email-tool';
import { HttpTool } from 'src/engine/core-modules/tool/tools/http-tool/http-tool';
import { NavigateAppTool } from 'src/engine/core-modules/tool/tools/navigate-tool/navigate-app-tool';
import { SearchHelpCenterTool } from 'src/engine/core-modules/tool/tools/search-help-center-tool/search-help-center-tool';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

@Injectable()
export class ActionToolProvider implements ToolProvider {
  readonly category = ToolCategory.ACTION;

  private readonly toolMap: Map<string, Tool>;

  constructor(
    private readonly httpTool: HttpTool,
    private readonly sendEmailTool: SendEmailTool,
    private readonly draftEmailTool: DraftEmailTool,
    private readonly searchHelpCenterTool: SearchHelpCenterTool,
    private readonly codeInterpreterTool: CodeInterpreterTool,
    private readonly navigateAppTool: NavigateAppTool,
    private readonly codeInterpreterService: CodeInterpreterService,
    private readonly permissionsService: PermissionsService,
  ) {
    this.toolMap = new Map<string, Tool>([
      ['http_request', this.httpTool],
      ['send_email', this.sendEmailTool],
      ['draft_email', this.draftEmailTool],
      ['search_help_center', this.searchHelpCenterTool],
      ['code_interpreter', this.codeInterpreterTool],
      ['navigate_app', this.navigateAppTool],
    ]);
  }

  async isAvailable(_context: ToolProviderContext): Promise<boolean> {
    return true;
  }

  async generateDescriptors(
    context: ToolProviderContext,
    options?: GenerateDescriptorOptions,
  ): Promise<(ToolIndexEntry | ToolDescriptor)[]> {
    const includeSchemas = options?.includeSchemas ?? true;
    const descriptors: (ToolIndexEntry | ToolDescriptor)[] = [];

    const hasHttpPermission = await this.permissionsService.hasToolPermission(
      context.rolePermissionConfig,
      context.workspaceId,
      PermissionFlagType.HTTP_REQUEST_TOOL,
    );

    if (hasHttpPermission) {
      descriptors.push(
        this.buildDescriptor('http_request', this.httpTool, includeSchemas),
      );
    }

    const hasEmailPermission = await this.permissionsService.hasToolPermission(
      context.rolePermissionConfig,
      context.workspaceId,
      PermissionFlagType.SEND_EMAIL_TOOL,
    );

    if (hasEmailPermission) {
      descriptors.push(
        this.buildDescriptor('send_email', this.sendEmailTool, includeSchemas),
      );
      descriptors.push(
        this.buildDescriptor(
          'draft_email',
          this.draftEmailTool,
          includeSchemas,
        ),
      );
    }

    descriptors.push(
      this.buildDescriptor(
        'search_help_center',
        this.searchHelpCenterTool,
        includeSchemas,
      ),
    );

    descriptors.push(
      this.buildDescriptor(
        'navigate_app',
        this.navigateAppTool,
        includeSchemas,
      ),
    );

    const hasCodeInterpreterPermission =
      this.codeInterpreterService.isEnabled() &&
      (await this.permissionsService.hasToolPermission(
        context.rolePermissionConfig,
        context.workspaceId,
        PermissionFlagType.CODE_INTERPRETER_TOOL,
      ));

    if (hasCodeInterpreterPermission) {
      descriptors.push(
        this.buildDescriptor(
          'code_interpreter',
          this.codeInterpreterTool,
          includeSchemas,
        ),
      );
    }

    return descriptors;
  }

  async executeStaticTool(
    toolName: string,
    args: Record<string, unknown>,
    context: ToolProviderContext,
  ): Promise<ToolOutput> {
    const tool = this.toolMap.get(toolName);

    if (!tool) {
      throw new Error(
        `Unknown action tool "${toolName}" (category: ${this.category})`,
      );
    }

    return tool.execute(args, {
      workspaceId: context.workspaceId,
      userId: context.userId,
      userWorkspaceId: context.userWorkspaceId,
      onCodeExecutionUpdate: context.onCodeExecutionUpdate,
    });
  }

  private buildDescriptor(
    toolId: string,
    tool: Tool,
    includeSchemas: boolean,
  ): ToolIndexEntry | ToolDescriptor {
    return {
      name: toolId,
      description: tool.description,
      category: ToolCategory.ACTION,
      icon: 'IconPlayerPlay',
      ...(includeSchemas && {
        inputSchema: z.toJSONSchema(tool.inputSchema as z.ZodType),
      }),
      executionRef: { kind: 'static', toolId },
    };
  }
}
