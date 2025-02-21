import { Inject, Injectable } from '@nestjs/common';

import graphqlFields from 'graphql-fields';
import {
  capitalize,
  isObjectRecordUnderObjectRecordsPermissions,
  PermissionsOnAllObjectRecords,
  SettingsFeatures,
} from 'twenty-shared';
import { DataSource, ObjectLiteral } from 'typeorm';

import { ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { IConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/connection.interface';
import { IEdge } from 'src/engine/api/graphql/workspace-query-runner/interfaces/edge.interface';
import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import {
  ResolverArgs,
  ResolverArgsType,
  WorkspaceResolverBuilderMethodNames,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { SYSTEM_OBJECTS_PERMISSIONS_REQUIREMENTS } from 'src/engine/api/graphql/graphql-query-runner/constants/system-objects-permissions-requirements.constant';
import { GraphqlQuerySelectedFieldsResult } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-selected-fields/graphql-selected-fields.parser';
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { ProcessNestedRelationsHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/process-nested-relations.helper';
import { ApiEventEmitterService } from 'src/engine/api/graphql/graphql-query-runner/services/api-event-emitter.service';
import { QueryResultGettersFactory } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/query-result-getters.factory';
import { QueryRunnerArgsFactory } from 'src/engine/api/graphql/workspace-query-runner/factories/query-runner-args.factory';
import { workspaceQueryRunnerGraphqlApiExceptionHandler } from 'src/engine/api/graphql/workspace-query-runner/utils/workspace-query-runner-graphql-api-exception-handler.util';
import { WorkspaceQueryHookService } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.service';
import { RESOLVER_METHOD_NAMES } from 'src/engine/api/graphql/workspace-resolver-builder/constants/resolver-method-names';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

export type GraphqlQueryResolverExecutionArgs<Input extends ResolverArgs> = {
  args: Input;
  options: WorkspaceQueryRunnerOptions;
  dataSource: DataSource;
  repository: WorkspaceRepository<ObjectLiteral>;
  graphqlQueryParser: GraphqlQueryParser;
  graphqlQuerySelectedFieldsResult: GraphqlQuerySelectedFieldsResult;
};

@Injectable()
export abstract class GraphqlQueryBaseResolverService<
  Input extends ResolverArgs,
  Response extends
    | ObjectRecord
    | ObjectRecord[]
    | IConnection<ObjectRecord, IEdge<ObjectRecord>>
    | IConnection<ObjectRecord, IEdge<ObjectRecord>>[],
> {
  @Inject()
  protected readonly workspaceQueryHookService: WorkspaceQueryHookService;
  @Inject()
  protected readonly queryRunnerArgsFactory: QueryRunnerArgsFactory;
  @Inject()
  protected readonly queryResultGettersFactory: QueryResultGettersFactory;
  @Inject()
  protected readonly apiEventEmitterService: ApiEventEmitterService;
  @Inject()
  protected readonly twentyORMGlobalManager: TwentyORMGlobalManager;
  @Inject()
  protected readonly processNestedRelationsHelper: ProcessNestedRelationsHelper;
  @Inject()
  protected readonly featureFlagService: FeatureFlagService;
  @Inject()
  protected readonly permissionsService: PermissionsService;

  public async execute(
    args: Input,
    options: WorkspaceQueryRunnerOptions,
    operationName: WorkspaceResolverBuilderMethodNames,
  ): Promise<Response | undefined> {
    try {
      const { authContext, objectMetadataItemWithFieldMaps } = options;

      await this.validate(args, options);

      const featureFlagsMap =
        await this.featureFlagService.getWorkspaceFeatureFlagsMap(
          authContext.workspace.id,
        );

      if (
        featureFlagsMap[FeatureFlagKey.IsPermissionsEnabled] &&
        objectMetadataItemWithFieldMaps.isSystem === true
      ) {
        await this.validateSystemObjectPermissionsOrThrow(options);
      }

      if (
        featureFlagsMap[FeatureFlagKey.IsPermissionsEnabled] &&
        isObjectRecordUnderObjectRecordsPermissions({
          isCustom: objectMetadataItemWithFieldMaps.isCustom,
          nameSingular: objectMetadataItemWithFieldMaps.nameSingular,
        })
      ) {
        await this.validateCustomObjectPermissionsOrThrow({
          operationName,
          options,
        });
      }

      const hookedArgs =
        await this.workspaceQueryHookService.executePreQueryHooks(
          authContext,
          objectMetadataItemWithFieldMaps.nameSingular,
          operationName,
          args,
        );

      const computedArgs = (await this.queryRunnerArgsFactory.create(
        hookedArgs,
        options,
        ResolverArgsType[capitalize(operationName)],
      )) as Input;

      const dataSource =
        await this.twentyORMGlobalManager.getDataSourceForWorkspace(
          authContext.workspace.id,
        );

      const repository = dataSource.getRepository(
        objectMetadataItemWithFieldMaps.nameSingular,
      );

      const graphqlQueryParser = new GraphqlQueryParser(
        objectMetadataItemWithFieldMaps.fieldsByName,
        options.objectMetadataMaps,
        featureFlagsMap,
      );

      const selectedFields = graphqlFields(options.info);

      const graphqlQuerySelectedFieldsResult =
        graphqlQueryParser.parseSelectedFields(
          objectMetadataItemWithFieldMaps,
          selectedFields,
        );

      const graphqlQueryResolverExecutionArgs = {
        args: computedArgs,
        options,
        dataSource,
        repository,
        graphqlQueryParser,
        graphqlQuerySelectedFieldsResult,
      };

      const results = await this.resolve(
        graphqlQueryResolverExecutionArgs,
        featureFlagsMap,
      );

      const resultWithGetters = await this.queryResultGettersFactory.create(
        results,
        objectMetadataItemWithFieldMaps,
        authContext.workspace.id,
        options.objectMetadataMaps,
        featureFlagsMap[FeatureFlagKey.IsNewRelationEnabled],
      );

      const resultWithGettersArray = Array.isArray(resultWithGetters)
        ? resultWithGetters
        : [resultWithGetters];

      await this.workspaceQueryHookService.executePostQueryHooks(
        authContext,
        objectMetadataItemWithFieldMaps.nameSingular,
        operationName,
        resultWithGettersArray,
      );

      return resultWithGetters;
    } catch (error) {
      workspaceQueryRunnerGraphqlApiExceptionHandler(error, options);
    }
  }

  private async validateSystemObjectPermissionsOrThrow(
    options: WorkspaceQueryRunnerOptions,
  ) {
    const { authContext, objectMetadataItemWithFieldMaps } = options;

    if (
      Object.keys(SYSTEM_OBJECTS_PERMISSIONS_REQUIREMENTS).includes(
        objectMetadataItemWithFieldMaps.nameSingular,
      )
    ) {
      if (!authContext.apiKey) {
        if (!authContext.userWorkspaceId) {
          throw new AuthException(
            'Missing userWorkspaceId in authContext',
            AuthExceptionCode.USER_WORKSPACE_NOT_FOUND,
          );
        }

        const permissionRequired: SettingsFeatures =
          SYSTEM_OBJECTS_PERMISSIONS_REQUIREMENTS[
            objectMetadataItemWithFieldMaps.nameSingular
          ];

        const userHasPermission =
          await this.permissionsService.userHasWorkspaceSettingPermission({
            userWorkspaceId: authContext.userWorkspaceId,
            _setting: permissionRequired,
            workspaceId: authContext.workspace.id,
          });

        if (!userHasPermission) {
          throw new PermissionsException(
            PermissionsExceptionMessage.PERMISSION_DENIED,
            PermissionsExceptionCode.PERMISSION_DENIED,
          );
        }
      }
    }
  }

  private async validateCustomObjectPermissionsOrThrow({
    operationName,
    options,
  }: {
    operationName: WorkspaceResolverBuilderMethodNames;
    options: WorkspaceQueryRunnerOptions;
  }) {
    if (!options.authContext.apiKey) {
      if (!options.authContext.userWorkspaceId) {
        throw new AuthException(
          'Missing userWorkspaceId in authContext',
          AuthExceptionCode.USER_WORKSPACE_NOT_FOUND,
        );
      }

      const requiredPermission =
        this.getRequiredPermissionForMethod(operationName);

      const userHasPermission =
        await this.permissionsService.userHasObjectRecordsPermission({
          userWorkspaceId: options.authContext.userWorkspaceId,
          requiredPermission,
          workspaceId: options.authContext.workspace.id,
        });

      if (!userHasPermission) {
        throw new PermissionsException(
          PermissionsExceptionMessage.PERMISSION_DENIED,
          PermissionsExceptionCode.PERMISSION_DENIED,
        );
      }
    }
  }

  private getRequiredPermissionForMethod(
    operationName: WorkspaceResolverBuilderMethodNames,
  ) {
    switch (operationName) {
      case RESOLVER_METHOD_NAMES.FIND_MANY:
      case RESOLVER_METHOD_NAMES.FIND_ONE:
      case RESOLVER_METHOD_NAMES.FIND_DUPLICATES:
      case RESOLVER_METHOD_NAMES.SEARCH:
        return PermissionsOnAllObjectRecords.READ_ALL_OBJECT_RECORDS;
      case RESOLVER_METHOD_NAMES.CREATE_MANY:
      case RESOLVER_METHOD_NAMES.CREATE_ONE:
      case RESOLVER_METHOD_NAMES.UPDATE_MANY:
      case RESOLVER_METHOD_NAMES.UPDATE_ONE:
        return PermissionsOnAllObjectRecords.UPDATE_ALL_OBJECT_RECORDS;
      case RESOLVER_METHOD_NAMES.DELETE_MANY:
      case RESOLVER_METHOD_NAMES.DELETE_ONE:
      case RESOLVER_METHOD_NAMES.RESTORE_MANY:
      case RESOLVER_METHOD_NAMES.RESTORE_ONE:
        return PermissionsOnAllObjectRecords.SOFT_DELETE_ALL_OBJECT_RECORDS;
      case RESOLVER_METHOD_NAMES.DESTROY_MANY:
      case RESOLVER_METHOD_NAMES.DESTROY_ONE:
        return PermissionsOnAllObjectRecords.DESTROY_ALL_OBJECT_RECORDS;
      default:
        throw new PermissionsException(
          PermissionsExceptionMessage.UNKNOWN_OPERATION_NAME,
          PermissionsExceptionCode.UNKNOWN_OPERATION_NAME,
        );
    }
  }

  protected abstract resolve(
    executionArgs: GraphqlQueryResolverExecutionArgs<Input>,
    featureFlagsMap: Record<FeatureFlagKey, boolean>,
  ): Promise<Response>;

  protected abstract validate(
    args: Input,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<void>;
}
