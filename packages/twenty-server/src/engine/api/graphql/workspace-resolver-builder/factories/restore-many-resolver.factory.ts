import { Injectable } from '@nestjs/common';

import graphqlFields from 'graphql-fields';
import { ObjectRecord } from 'twenty-shared/types';

import { type WorkspaceResolverBuilderFactoryInterface } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolver-builder-factory.interface';
import {
  type Resolver,
  type RestoreManyResolverArgs,
} from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';
import { type WorkspaceSchemaBuilderContext } from 'src/engine/api/graphql/workspace-schema-builder/interfaces/workspace-schema-builder-context.interface';

import { CommonRestoreManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-restore-many-query-runner.service';
import { ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { workspaceQueryRunnerGraphqlApiExceptionHandler } from 'src/engine/api/graphql/workspace-query-runner/utils/workspace-query-runner-graphql-api-exception-handler.util';
import { RESOLVER_METHOD_NAMES } from 'src/engine/api/graphql/workspace-resolver-builder/constants/resolver-method-names';

@Injectable()
export class RestoreManyResolverFactory
  implements WorkspaceResolverBuilderFactoryInterface
{
  public static methodName = RESOLVER_METHOD_NAMES.RESTORE_MANY;

  constructor(
    private readonly commonRestoreManyQueryRunnerService: CommonRestoreManyQueryRunnerService,
  ) {}

  create(
    context: WorkspaceSchemaBuilderContext,
  ): Resolver<RestoreManyResolverArgs> {
    const internalContext = context;

    return async (_source, args, _context, info) => {
      const selectedFields = graphqlFields(info);

      try {
        const records = await this.commonRestoreManyQueryRunnerService.execute(
          { ...args, selectedFields },
          internalContext,
        );

        const typeORMObjectRecordsParser =
          new ObjectRecordsToGraphqlConnectionHelper(
            internalContext.objectMetadataMaps,
          );

        return records.map((record: ObjectRecord) =>
          typeORMObjectRecordsParser.processRecord({
            objectRecord: record,
            objectName:
              internalContext.objectMetadataItemWithFieldMaps.nameSingular,
            take: 1,
            totalCount: 1,
          }),
        );
      } catch (error) {
        workspaceQueryRunnerGraphqlApiExceptionHandler(error);
      }
    };
  }
}
