import { Inject, Injectable } from '@nestjs/common';

import graphqlFields from 'graphql-fields';
import { capitalize, SettingsFeatures } from 'twenty-shared';
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

      const permissionsEnabled = await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IsPermissionsEnabled,
        authContext.workspace.id,
      );

      if (
        permissionsEnabled === true &&
        objectMetadataItemWithFieldMaps.isSystem === true
      ) {
        await this.validateSystemObjectPermissions(options);
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

      const featureFlagsMap =
        await this.featureFlagService.getWorkspaceFeatureFlagsMap(
          authContext.workspace.id,
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

      const results = await this.resolve(graphqlQueryResolverExecutionArgs);

      const resultWithGetters = await this.queryResultGettersFactory.create(
        results,
        objectMetadataItemWithFieldMaps,
        authContext.workspace.id,
        options.objectMetadataMaps,
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

  private async validateSystemObjectPermissions(
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

  protected abstract resolve(
    executionArgs: GraphqlQueryResolverExecutionArgs<Input>,
  ): Promise<Response>;

  protected abstract validate(
    args: Input,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<void>;
}
