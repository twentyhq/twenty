import { Inject, Injectable, Logger, Optional } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { PermissionFlagType } from 'twenty-shared/constants';

import { CreateRecordService } from 'src/engine/core-modules/record-crud/services/create-record.service';
import { DeleteRecordService } from 'src/engine/core-modules/record-crud/services/delete-record.service';
import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { UpdateRecordService } from 'src/engine/core-modules/record-crud/services/update-record.service';
import { createDirectRecordToolsFactory } from 'src/engine/core-modules/record-crud/tool-factory/direct-record-tools.factory';
import { PerObjectToolGeneratorService } from 'src/engine/core-modules/tool-generator/services/per-object-tool-generator.service';
import { WORKFLOW_TOOL_SERVICE_TOKEN } from 'src/engine/core-modules/tool-provider/constants/workflow-tool-service.token';
import { ToolCategory } from 'src/engine/core-modules/tool-provider/enums/tool-category.enum';
import { type ToolSpecification } from 'src/engine/core-modules/tool-provider/types/tool-specification.type';
import { ToolType } from 'src/engine/core-modules/tool/enums/tool-type.enum';
import { CodeInterpreterTool } from 'src/engine/core-modules/tool/tools/code-interpreter-tool/code-interpreter-tool';
import { HttpTool } from 'src/engine/core-modules/tool/tools/http-tool/http-tool';
import { SearchHelpCenterTool } from 'src/engine/core-modules/tool/tools/search-help-center-tool/search-help-center-tool';
import { SendEmailTool } from 'src/engine/core-modules/tool/tools/send-email-tool/send-email-tool';
import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';
import { AgentModelConfigService } from 'src/engine/metadata-modules/ai/ai-models/services/agent-model-config.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { FieldMetadataToolsFactory } from 'src/engine/metadata-modules/field-metadata/tools/field-metadata-tools.factory';
import { ObjectMetadataToolsFactory } from 'src/engine/metadata-modules/object-metadata/tools/object-metadata-tools.factory';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
// Type-only import to avoid circular dependency at file level
import type { WorkflowToolWorkspaceService } from 'src/modules/workflow/workflow-tools/services/workflow-tool.workspace-service';

type ActionTool = {
  tool: Tool;
  flag?: PermissionFlagType;
};

@Injectable()
export class ToolProviderService {
  private readonly logger = new Logger(ToolProviderService.name);
  private readonly actionTools: Map<ToolType, ActionTool>;

  constructor(
    private readonly httpTool: HttpTool,
    private readonly sendEmailTool: SendEmailTool,
    private readonly searchHelpCenterTool: SearchHelpCenterTool,
    private readonly codeInterpreterTool: CodeInterpreterTool,
    private readonly perObjectToolGenerator: PerObjectToolGeneratorService,
    private readonly createRecordService: CreateRecordService,
    private readonly updateRecordService: UpdateRecordService,
    private readonly deleteRecordService: DeleteRecordService,
    private readonly findRecordsService: FindRecordsService,
    // Optional to avoid circular dependency with WorkflowExecutorModule (null when called from workflow context)
    @Optional()
    @Inject(WORKFLOW_TOOL_SERVICE_TOKEN)
    private readonly workflowToolService: WorkflowToolWorkspaceService | null,
    private readonly objectMetadataToolsFactory: ObjectMetadataToolsFactory,
    private readonly fieldMetadataToolsFactory: FieldMetadataToolsFactory,
    private readonly agentModelConfigService: AgentModelConfigService,
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly permissionsService: PermissionsService,
  ) {
    this.actionTools = new Map([
      [
        ToolType.HTTP_REQUEST,
        {
          tool: this.httpTool,
          flag: PermissionFlagType.HTTP_REQUEST_TOOL,
        },
      ],
      [
        ToolType.SEND_EMAIL,
        {
          tool: this.sendEmailTool,
          flag: PermissionFlagType.SEND_EMAIL_TOOL,
        },
      ],
      [
        ToolType.SEARCH_HELP_CENTER,
        {
          tool: this.searchHelpCenterTool,
        },
      ],
      [
        ToolType.CODE_INTERPRETER,
        {
          tool: this.codeInterpreterTool,
          flag: PermissionFlagType.CODE_INTERPRETER_TOOL,
        },
      ],
    ]);
  }

  getToolByType(toolType: ToolType): Tool {
    const actionTool = this.actionTools.get(toolType);

    if (!actionTool) {
      throw new Error(`Unknown tool type: ${toolType}`);
    }

    return actionTool.tool;
  }

  async getTools(spec: ToolSpecification): Promise<ToolSet> {
    const tools: ToolSet = {};

    for (const category of spec.categories) {
      const categoryTools = await this.getToolsForCategory(category, spec);

      Object.assign(tools, categoryTools);
    }

    this.logger.log(
      `Generated ${Object.keys(tools).length} tools for categories: [${spec.categories.join(', ')}]`,
    );

    if (spec.wrapWithErrorContext) {
      return this.wrapToolsWithErrorContext(tools);
    }

    return tools;
  }

  private async getToolsForCategory(
    category: ToolCategory,
    spec: ToolSpecification,
  ): Promise<ToolSet> {
    switch (category) {
      case ToolCategory.DATABASE_CRUD:
        return this.getDatabaseTools(spec);
      case ToolCategory.ACTION:
        return this.getActionTools(spec);
      case ToolCategory.WORKFLOW:
        return this.getWorkflowTools(spec);
      case ToolCategory.METADATA:
        return this.getMetadataTools(spec);
      case ToolCategory.NATIVE_MODEL:
        return this.getNativeModelTools(spec);
      default:
        return {};
    }
  }

  private async getDatabaseTools(spec: ToolSpecification): Promise<ToolSet> {
    if (!spec.rolePermissionConfig) {
      return {};
    }

    const factory = createDirectRecordToolsFactory({
      createRecordService: this.createRecordService,
      updateRecordService: this.updateRecordService,
      deleteRecordService: this.deleteRecordService,
      findRecordsService: this.findRecordsService,
    });

    return this.perObjectToolGenerator.generate(
      {
        workspaceId: spec.workspaceId,
        rolePermissionConfig: spec.rolePermissionConfig,
        actorContext: spec.actorContext,
      },
      [factory],
    );
  }

  private async getActionTools(spec: ToolSpecification): Promise<ToolSet> {
    const tools: ToolSet = {};
    const executionContext = { workspaceId: spec.workspaceId };
    const excludedTools = new Set(spec.excludeTools ?? []);

    for (const [toolType, { tool, flag }] of this.actionTools) {
      if (excludedTools.has(toolType)) {
        continue;
      }

      if (!flag) {
        tools[toolType.toLowerCase()] = {
          description: tool.description,
          inputSchema: tool.inputSchema,
          execute: async (parameters: { input: ToolInput }) =>
            tool.execute(parameters.input, executionContext),
        };
      } else if (spec.rolePermissionConfig && spec.workspaceId) {
        const hasPermission = await this.permissionsService.hasToolPermission(
          spec.rolePermissionConfig,
          spec.workspaceId,
          flag,
        );

        if (hasPermission) {
          tools[toolType.toLowerCase()] = {
            description: tool.description,
            inputSchema: tool.inputSchema,
            execute: async (parameters: { input: ToolInput }) =>
              tool.execute(parameters.input, executionContext),
          };
        }
      }
    }

    return tools;
  }

  private async getWorkflowTools(spec: ToolSpecification): Promise<ToolSet> {
    if (!this.workflowToolService) {
      return {};
    }

    if (!spec.rolePermissionConfig) {
      return {};
    }

    const hasWorkflowPermission =
      await this.permissionsService.checkRolesPermissions(
        spec.rolePermissionConfig,
        spec.workspaceId,
        PermissionFlagType.WORKFLOWS,
      );

    if (!hasWorkflowPermission) {
      return {};
    }

    const workflowTools = this.workflowToolService.generateWorkflowTools(
      spec.workspaceId,
      spec.rolePermissionConfig,
    );

    const recordStepTools =
      await this.workflowToolService.generateRecordStepConfiguratorTools(
        spec.workspaceId,
        spec.rolePermissionConfig,
      );

    return { ...workflowTools, ...recordStepTools };
  }

  private async getMetadataTools(spec: ToolSpecification): Promise<ToolSet> {
    if (spec.rolePermissionConfig) {
      const hasDataModelPermission =
        await this.permissionsService.checkRolesPermissions(
          spec.rolePermissionConfig,
          spec.workspaceId,
          PermissionFlagType.DATA_MODEL,
        );

      if (!hasDataModelPermission) {
        return {};
      }
    }

    const objectMetadataTools = this.objectMetadataToolsFactory.generateTools(
      spec.workspaceId,
    );

    const fieldMetadataTools = this.fieldMetadataToolsFactory.generateTools(
      spec.workspaceId,
    );

    return { ...objectMetadataTools, ...fieldMetadataTools };
  }

  private async getNativeModelTools(spec: ToolSpecification): Promise<ToolSet> {
    if (!spec.agent) {
      return {};
    }

    const registeredModel =
      await this.aiModelRegistryService.resolveModelForAgent(spec.agent);

    return this.agentModelConfigService.getNativeModelTools(
      registeredModel,
      spec.agent,
    );
  }

  private wrapToolsWithErrorContext(tools: ToolSet): ToolSet {
    const wrappedTools: ToolSet = {};

    for (const [toolName, tool] of Object.entries(tools)) {
      if (!tool.execute) {
        wrappedTools[toolName] = tool;
        continue;
      }

      const originalExecute = tool.execute;

      wrappedTools[toolName] = {
        ...tool,
        execute: async (...args: Parameters<typeof originalExecute>) => {
          try {
            return await originalExecute(...args);
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);

            return {
              success: false,
              error: {
                message: errorMessage,
                tool: toolName,
                suggestion: this.generateErrorSuggestion(
                  toolName,
                  errorMessage,
                ),
              },
            };
          }
        },
      };
    }

    return wrappedTools;
  }

  private generateErrorSuggestion(
    toolName: string,
    errorMessage: string,
  ): string {
    const lowerError = errorMessage.toLowerCase();

    if (
      lowerError.includes('not found') ||
      lowerError.includes('does not exist')
    ) {
      return 'Verify the ID or name exists with a search query first';
    }

    if (
      lowerError.includes('permission') ||
      lowerError.includes('forbidden') ||
      lowerError.includes('unauthorized')
    ) {
      return 'This operation requires elevated permissions or a different role';
    }

    if (lowerError.includes('invalid') || lowerError.includes('validation')) {
      return 'Check the tool schema for valid parameter formats and types';
    }

    if (
      lowerError.includes('duplicate') ||
      lowerError.includes('already exists')
    ) {
      return 'A record with this identifier already exists. Try updating instead of creating';
    }

    if (lowerError.includes('required') || lowerError.includes('missing')) {
      return 'Required fields are missing. Check which fields are mandatory for this operation';
    }

    return 'Try adjusting the parameters or using a different approach';
  }
}
