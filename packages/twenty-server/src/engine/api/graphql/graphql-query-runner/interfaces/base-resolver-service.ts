import { Inject, Injectable } from '@nestjs/common';

import graphqlFields from 'graphql-fields';
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

import { GraphqlQuerySelectedFieldsResult } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query-selected-fields/graphql-selected-fields.parser';
import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { ApiEventEmitterService } from 'src/engine/api/graphql/graphql-query-runner/services/api-event-emitter.service';
import { QueryResultGettersFactory } from 'src/engine/api/graphql/workspace-query-runner/factories/query-result-getters/query-result-getters.factory';
import { QueryRunnerArgsFactory } from 'src/engine/api/graphql/workspace-query-runner/factories/query-runner-args.factory';
import { WorkspaceQueryHookService } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-hook/workspace-query-hook.service';
import { WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace.repository';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { capitalize } from 'src/utils/capitalize';

export type GraphqlQueryResolverExecutionArgs<Input extends ResolverArgs> = {
  args: Input;
  options: WorkspaceQueryRunnerOptions;
  datasource: DataSource;
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

  protected operationName: WorkspaceResolverBuilderMethodNames;

  public async execute(
    args: Input,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<Response> {
    if (!this.operationName) {
      throw new Error('Operation name is not set');
    }

    const { authContext, objectMetadataItemWithFieldMaps } = options;

    await this.validate(args, options);

    const hookedArgs =
      await this.workspaceQueryHookService.executePreQueryHooks(
        authContext,
        objectMetadataItemWithFieldMaps.nameSingular,
        this.operationName,
        args,
      );

    const computedArgs = (await this.queryRunnerArgsFactory.create(
      hookedArgs,
      options,
      ResolverArgsType[capitalize(this.operationName)],
    )) as Input;

    const datasource =
      await this.twentyORMGlobalManager.getDataSourceForWorkspace(
        authContext.workspace.id,
      );

    const repository = datasource.getRepository(
      objectMetadataItemWithFieldMaps.namePlural,
    );

    const graphqlQueryParser = new GraphqlQueryParser(
      objectMetadataItemWithFieldMaps.fieldsByName,
      options.objectMetadataMaps,
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
      datasource,
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
      this.operationName,
      resultWithGettersArray,
    );

    return resultWithGetters;
  }

  protected abstract resolve(
    executionArgs: GraphqlQueryResolverExecutionArgs<Input>,
  ): Promise<Response>;

  protected abstract validate(
    args: Input,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<void>;
}
