import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type ToolSet } from 'ai';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';

import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { buildUserAuthContext } from 'src/engine/core-modules/auth/utils/build-user-auth-context.util';
import { LogicFunctionExecutorService } from 'src/engine/core-modules/logic-function/logic-function-executor/logic-function-executor.service';
import { CreateManyRecordsService } from 'src/engine/core-modules/record-crud/services/create-many-records.service';
import { CreateRecordService } from 'src/engine/core-modules/record-crud/services/create-record.service';
import { DeleteRecordService } from 'src/engine/core-modules/record-crud/services/delete-record.service';
import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { UpdateManyRecordsService } from 'src/engine/core-modules/record-crud/services/update-many-records.service';
import { UpdateRecordService } from 'src/engine/core-modules/record-crud/services/update-record.service';
import { type ToolCategory } from 'src/engine/core-modules/tool-provider/enums/tool-category.enum';
import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { stripLoadingMessage } from 'src/engine/core-modules/tool/utils/wrap-tool-for-execution.util';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// Handler for individually registered static tools (e.g., action tools)
export interface StaticToolHandler {
  execute(args: ToolInput, context: ToolProviderContext): Promise<unknown>;
}

// Generator that produces a ToolSet on demand for a category (workflow, view, etc.)
// Used as a fallback when no per-tool handler is registered.
export type CategoryToolGenerator = (
  context: ToolProviderContext,
) => Promise<ToolSet>;

@Injectable()
export class ToolExecutorService {
  private readonly logger = new Logger(ToolExecutorService.name);

  // Per-tool handlers (action tools, etc.)
  private readonly staticToolHandlers = new Map<string, StaticToolHandler>();

  // Category-level ToolSet generators (workflow, view, dashboard, metadata)
  private readonly categoryGenerators = new Map<
    ToolCategory,
    CategoryToolGenerator
  >();

  constructor(
    private readonly findRecordsService: FindRecordsService,
    private readonly createRecordService: CreateRecordService,
    private readonly createManyRecordsService: CreateManyRecordsService,
    private readonly updateRecordService: UpdateRecordService,
    private readonly updateManyRecordsService: UpdateManyRecordsService,
    private readonly deleteRecordService: DeleteRecordService,
    private readonly logicFunctionExecutorService: LogicFunctionExecutorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  registerStaticHandler(toolId: string, handler: StaticToolHandler): void {
    this.staticToolHandlers.set(toolId, handler);
  }

  registerCategoryGenerator(
    category: ToolCategory,
    generator: CategoryToolGenerator,
  ): void {
    this.categoryGenerators.set(category, generator);
  }

  async dispatch(
    descriptor: ToolDescriptor,
    args: Record<string, unknown>,
    context: ToolProviderContext,
  ): Promise<unknown> {
    const cleanArgs = stripLoadingMessage(args);

    switch (descriptor.executionRef.kind) {
      case 'database_crud':
        return this.dispatchDatabaseCrud(
          descriptor.executionRef,
          cleanArgs,
          context,
        );
      case 'static':
        return this.dispatchStaticTool(descriptor, cleanArgs, context);
      case 'logic_function':
        return this.dispatchLogicFunction(
          descriptor.executionRef,
          cleanArgs,
          context,
        );
    }
  }

  private async dispatchDatabaseCrud(
    ref: { objectNameSingular: string; operation: string },
    args: Record<string, unknown>,
    context: ToolProviderContext,
  ): Promise<unknown> {
    const authContext =
      context.authContext ?? (await this.buildAuthContext(context));

    switch (ref.operation) {
      case 'find': {
        const { limit, offset, orderBy, ...filter } = args;

        return this.findRecordsService.execute({
          objectName: ref.objectNameSingular,
          filter,
          orderBy: orderBy as never,
          limit: limit as number | undefined,
          offset: offset as number | undefined,
          authContext,
          rolePermissionConfig: context.rolePermissionConfig,
        });
      }

      case 'find_one':
        return this.findRecordsService.execute({
          objectName: ref.objectNameSingular,
          filter: { id: { eq: args.id } },
          limit: 1,
          authContext,
          rolePermissionConfig: context.rolePermissionConfig,
        });

      case 'create':
        return this.createRecordService.execute({
          objectName: ref.objectNameSingular,
          objectRecord: args,
          authContext,
          rolePermissionConfig: context.rolePermissionConfig,
          createdBy: context.actorContext,
          slimResponse: true,
        });

      case 'create_many':
        return this.createManyRecordsService.execute({
          objectName: ref.objectNameSingular,
          objectRecords: args.records as Record<string, unknown>[],
          authContext,
          rolePermissionConfig: context.rolePermissionConfig,
          createdBy: context.actorContext,
          slimResponse: true,
        });

      case 'update': {
        const { id, ...fields } = args;
        const objectRecord = Object.fromEntries(
          Object.entries(fields).filter(([, value]) => value !== undefined),
        );

        return this.updateRecordService.execute({
          objectName: ref.objectNameSingular,
          objectRecordId: id as string,
          objectRecord,
          authContext,
          rolePermissionConfig: context.rolePermissionConfig,
          slimResponse: true,
        });
      }

      case 'update_many':
        return this.updateManyRecordsService.execute({
          objectName: ref.objectNameSingular,
          filter: args.filter as Record<string, unknown>,
          data: args.data as Record<string, unknown>,
          authContext,
          rolePermissionConfig: context.rolePermissionConfig,
          slimResponse: true,
        });

      case 'delete':
        return this.deleteRecordService.execute({
          objectName: ref.objectNameSingular,
          objectRecordId: args.id as string,
          authContext,
          rolePermissionConfig: context.rolePermissionConfig,
          soft: true,
        });

      default:
        throw new Error(`Unknown database_crud operation: ${ref.operation}`);
    }
  }

  private async dispatchStaticTool(
    descriptor: ToolDescriptor,
    args: Record<string, unknown>,
    context: ToolProviderContext,
  ): Promise<unknown> {
    if (descriptor.executionRef.kind !== 'static') {
      throw new Error('Expected static executionRef');
    }

    // Per-tool handler first (action tools)
    const handler = this.staticToolHandlers.get(descriptor.executionRef.toolId);

    if (handler) {
      return handler.execute(args, context);
    }

    // Category-level generator fallback (workflow, view, dashboard, metadata)
    const generator = this.categoryGenerators.get(descriptor.category);

    if (!generator) {
      throw new Error(
        `No handler or generator for static tool: ${descriptor.executionRef.toolId}`,
      );
    }

    const toolSet = await generator(context);
    const tool = toolSet[descriptor.name];

    if (!tool?.execute) {
      throw new Error(
        `Tool ${descriptor.name} not found in generated ToolSet for category ${descriptor.category}`,
      );
    }

    // The tool's execute expects (args, ToolCallOptions). Pass args with
    // a dummy loadingMessage since the tool's internal strip is harmless.
    return tool.execute(
      { loadingMessage: '', ...args },
      { toolCallId: '', messages: [] },
    );
  }

  private async dispatchLogicFunction(
    ref: { logicFunctionId: string },
    args: Record<string, unknown>,
    context: ToolProviderContext,
  ): Promise<unknown> {
    const result = await this.logicFunctionExecutorService.execute({
      logicFunctionId: ref.logicFunctionId,
      workspaceId: context.workspaceId,
      payload: args,
    });

    if (result.error) {
      return {
        success: false,
        error: result.error.errorMessage,
      };
    }

    return {
      success: true,
      result: result.data,
    };
  }

  // Build authContext on demand for database CRUD operations
  private async buildAuthContext(
    context: ToolProviderContext,
  ): Promise<WorkspaceAuthContext> {
    if (!isDefined(context.userId) || !isDefined(context.userWorkspaceId)) {
      throw new AuthException(
        'userId and userWorkspaceId are required for database operations',
        AuthExceptionCode.UNAUTHENTICATED,
      );
    }

    const user = await this.userRepository.findOne({
      where: { id: context.userId },
    });

    if (!isDefined(user)) {
      throw new AuthException(
        'User not found',
        AuthExceptionCode.UNAUTHENTICATED,
      );
    }

    const { flatWorkspaceMemberMaps } =
      await this.workspaceCacheService.getOrRecompute(context.workspaceId, [
        'flatWorkspaceMemberMaps',
      ]);

    const workspaceMemberId = flatWorkspaceMemberMaps.idByUserId[user.id];

    const workspaceMember = isDefined(workspaceMemberId)
      ? flatWorkspaceMemberMaps.byId[workspaceMemberId]
      : undefined;

    if (!isDefined(workspaceMemberId) || !isDefined(workspaceMember)) {
      throw new AuthException(
        'Workspace member not found',
        AuthExceptionCode.UNAUTHENTICATED,
      );
    }

    return buildUserAuthContext({
      workspace: { id: context.workspaceId } as WorkspaceEntity,
      userWorkspaceId: context.userWorkspaceId,
      user,
      workspaceMemberId,
      workspaceMember,
    });
  }
}
