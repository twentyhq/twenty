import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type AggregateOperations } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { type ObjectRecordGroupBy } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { fromUserEntityToFlat } from 'src/engine/core-modules/user/utils/from-user-entity-to-flat.util';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';

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
import { GroupByRecordsService } from 'src/engine/core-modules/record-crud/services/group-by-records.service';
import { type FindRecordsParams } from 'src/engine/core-modules/record-crud/types/find-records-params.type';
import { UpdateManyRecordsService } from 'src/engine/core-modules/record-crud/services/update-many-records.service';
import { UpdateRecordService } from 'src/engine/core-modules/record-crud/services/update-record.service';
import { TOOL_PROVIDERS } from 'src/engine/core-modules/tool-provider/constants/tool-providers.token';
import { type ToolProvider } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';
import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { type ToolExecutionRef } from 'src/engine/core-modules/tool-provider/types/tool-execution-ref.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class ToolExecutorService {
  private readonly logger = new Logger(ToolExecutorService.name);

  constructor(
    @Inject(TOOL_PROVIDERS)
    private readonly providers: ToolProvider[],
    private readonly findRecordsService: FindRecordsService,
    private readonly groupByRecordsService: GroupByRecordsService,
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

  async dispatch(
    descriptor: ToolIndexEntry | ToolDescriptor,
    args: Record<string, unknown> | undefined,
    context: ToolProviderContext,
  ): Promise<ToolOutput> {
    const safeArgs = args ?? {};

    switch (descriptor.executionRef.kind) {
      case 'database_crud':
        return this.dispatchDatabaseCrud(
          descriptor.executionRef,
          safeArgs,
          context,
        );
      case 'static':
        return this.dispatchStaticTool(descriptor, safeArgs, context);
      case 'logic_function':
        return this.dispatchLogicFunction(
          descriptor.executionRef,
          safeArgs,
          context,
        );
    }
  }

  private async dispatchDatabaseCrud(
    ref: Extract<ToolExecutionRef, { kind: 'database_crud' }>,
    args: Record<string, unknown>,
    context: ToolProviderContext,
  ): Promise<ToolOutput> {
    const authContext =
      context.authContext ?? (await this.buildAuthContext(context));

    switch (ref.operation) {
      case 'find': {
        const { limit, offset, orderBy, ...filter } = args;

        return this.findRecordsService.execute({
          objectName: ref.objectNameSingular,
          filter,
          orderBy: orderBy as FindRecordsParams['orderBy'],
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

      case 'group_by': {
        const {
          groupBy,
          aggregateOperation,
          aggregateFieldName,
          limit: groupByLimit,
          orderBy: groupByOrderBy,
          ...groupByFilter
        } = args;

        return this.groupByRecordsService.execute({
          objectName: ref.objectNameSingular,
          groupBy: groupBy as ObjectRecordGroupBy,
          aggregateOperation: aggregateOperation as
            | keyof typeof AggregateOperations
            | undefined,
          aggregateFieldName: aggregateFieldName as string | undefined,
          limit: groupByLimit as number | undefined,
          orderBy: groupByOrderBy as 'ASC' | 'DESC' | undefined,
          filter: groupByFilter,
          authContext,
          rolePermissionConfig: context.rolePermissionConfig,
        });
      }
    }
  }

  private async dispatchStaticTool(
    descriptor: ToolIndexEntry | ToolDescriptor,
    args: Record<string, unknown>,
    context: ToolProviderContext,
  ): Promise<ToolOutput> {
    if (descriptor.executionRef.kind !== 'static') {
      throw new Error('Expected static executionRef');
    }

    const provider = this.providers.find(
      (candidate) => candidate.category === descriptor.category,
    );

    if (!provider) {
      throw new Error(
        `No provider registered for category "${descriptor.category}" (tool: ${descriptor.executionRef.toolId})`,
      );
    }

    // Defense-in-depth: catalog and by-name lookups already filter by
    // `isAvailable`, but re-verify at dispatch so the gate is enforced in
    // one place regardless of how the descriptor reached us.
    if (!(await provider.isAvailable(context))) {
      return {
        success: false,
        message: `Tool "${descriptor.name}" is not available`,
        error: `Tool "${descriptor.name}" is not available in this context. Use get_tool_catalog to see available tools.`,
      };
    }

    return provider.executeStaticTool(
      descriptor.executionRef.toolId,
      args,
      context,
    );
  }

  private async dispatchLogicFunction(
    ref: Extract<ToolExecutionRef, { kind: 'logic_function' }>,
    args: Record<string, unknown>,
    context: ToolProviderContext,
  ): Promise<ToolOutput> {
    const result = await this.logicFunctionExecutorService.execute({
      logicFunctionId: ref.logicFunctionId,
      workspaceId: context.workspaceId,
      payload: args,
    });

    if (result.error) {
      return {
        success: false,
        message: 'Logic function execution failed',
        error: result.error.errorMessage,
      };
    }

    return {
      success: true,
      message: 'Logic function executed successfully',
      result: result.data ?? undefined,
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
      workspace: { id: context.workspaceId } as FlatWorkspace,
      userWorkspaceId: context.userWorkspaceId,
      user: fromUserEntityToFlat(user),
      workspaceMemberId,
      workspaceMember,
    });
  }
}
