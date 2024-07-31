import { Injectable } from '@nestjs/common';

import { Record as IRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { WorkspaceResolverBuilderFactoryInterface } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolver-builder-factory.interface';
import {
  DeleteOneResolverArgs,
  ExecuteQuickActionOnOneResolverArgs,
  FindOneResolverArgs,
  Resolver,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { WorkspaceSchemaBuilderContext } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-schema-builder-context.interface';

import { workspaceQueryRunnerGraphqlApiExceptionHandler } from 'src/engine/api/graphql/workspace-query-runner/utils/workspace-query-runner-graphql-api-exception-handler.util';
import { WorkspaceQueryRunnerService } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.service';
import { QuickActionsService } from 'src/engine/core-modules/quick-actions/quick-actions.service';

@Injectable()
export class ExecuteQuickActionOnOneResolverFactory
  implements WorkspaceResolverBuilderFactoryInterface
{
  public static methodName = 'executeQuickActionOnOne' as const;

  constructor(
    private readonly workspaceQueryRunnerService: WorkspaceQueryRunnerService,
    private readonly quickActionsService: QuickActionsService,
  ) {}

  create(
    context: WorkspaceSchemaBuilderContext,
  ): Resolver<ExecuteQuickActionOnOneResolverArgs> {
    const internalContext = context;

    return (_source, args, context, info) => {
      try {
        return this.executeQuickActionOnOne(args, {
          authContext: internalContext.authContext,
          objectMetadataItem: internalContext.objectMetadataItem,
          info,
          fieldMetadataCollection: internalContext.fieldMetadataCollection,
          objectMetadataCollection: internalContext.objectMetadataCollection,
        });
      } catch (error) {
        workspaceQueryRunnerGraphqlApiExceptionHandler(error);
      }
    };
  }

  private async executeQuickActionOnOne<Record extends IRecord = IRecord>(
    args: DeleteOneResolverArgs,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<Record | undefined> {
    switch (options.objectMetadataItem.nameSingular) {
      case 'company': {
        await this.quickActionsService.executeQuickActionOnCompany(
          args.id,
          options.authContext.workspace.id,
          options.objectMetadataItem,
        );
        break;
      }
      case 'person': {
        await this.quickActionsService.createCompanyFromPerson(
          args.id,
          options.authContext.workspace.id,
          options.objectMetadataCollection,
        );
        break;
      }
      default:
        // TODO: different quick actions per object on frontend
        break;
    }

    return this.workspaceQueryRunnerService.findOne(
      { filter: { id: { eq: args.id } } } as FindOneResolverArgs,
      options,
    );
  }
}
