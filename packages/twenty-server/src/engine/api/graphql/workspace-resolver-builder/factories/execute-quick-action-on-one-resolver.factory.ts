import { Injectable } from '@nestjs/common';

import {
  Resolver,
  FindOneResolverArgs,
  ExecuteQuickActionOnOneResolverArgs,
  DeleteOneResolverArgs,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { Record as IRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import { WorkspaceSchemaBuilderContext } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-schema-builder-context.interface';
import { WorkspaceResolverBuilderFactoryInterface } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolver-builder-factory.interface';
import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';

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
      return this.executeQuickActionOnOne(args, {
        objectMetadataItem: internalContext.objectMetadataItem,
        userId: internalContext.userId,
        workspaceId: internalContext.workspaceId,
        info,
        fieldMetadataCollection: internalContext.fieldMetadataCollection,
        objectMetadataCollection: internalContext.objectMetadataCollection,
      });
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
          options.workspaceId,
          options.objectMetadataItem,
        );
        break;
      }
      case 'person': {
        await this.quickActionsService.createCompanyFromPerson(
          args.id,
          options.workspaceId,
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
