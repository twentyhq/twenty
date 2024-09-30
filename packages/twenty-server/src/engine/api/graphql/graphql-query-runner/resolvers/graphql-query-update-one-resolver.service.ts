import { ResolverService } from 'src/engine/api/graphql/graphql-query-runner/interfaces/resolver-service.interface';
import { Record as IRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { UpdateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import {
  GraphqlQueryRunnerException,
  GraphqlQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/graphql-query-runner/errors/graphql-query-runner.exception';
import { ObjectRecordsToGraphqlConnectionMapper } from 'src/engine/api/graphql/graphql-query-runner/orm-mappers/object-records-to-graphql-connection.mapper';
import { assertIsValidUuid } from 'src/engine/api/graphql/workspace-query-runner/utils/assert-is-valid-uuid.util';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';
import { generateObjectMetadataMap } from 'src/engine/metadata-modules/utils/generate-object-metadata-map.util';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

export class GraphqlQueryUpdateOneResolverService
  implements ResolverService<UpdateOneResolverArgs, IRecord>
{
  private twentyORMGlobalManager: TwentyORMGlobalManager;

  constructor(twentyORMGlobalManager: TwentyORMGlobalManager) {
    this.twentyORMGlobalManager = twentyORMGlobalManager;
  }

  async resolve<ObjectRecord extends IRecord = IRecord>(
    args: UpdateOneResolverArgs<Partial<ObjectRecord>>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<ObjectRecord> {
    const { authContext, objectMetadataItem, objectMetadataCollection } =
      options;
    const repository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        authContext.workspace.id,
        objectMetadataItem.nameSingular,
      );

    const objectMetadataMap = generateObjectMetadataMap(
      objectMetadataCollection,
    );

    const queryBuilder = repository.createQueryBuilder(
      objectMetadataItem.nameSingular,
    );

    const withFilterQueryBuilder = queryBuilder.where({ id: args.id });

    await withFilterQueryBuilder.update().set(args.data).execute();

    const updatedRecords = await withFilterQueryBuilder.getMany();

    if (updatedRecords.length === 0) {
      throw new GraphqlQueryRunnerException(
        'Record not found',
        GraphqlQueryRunnerExceptionCode.RECORD_NOT_FOUND,
      );
    }

    const updatedRecord = updatedRecords[0] as ObjectRecord;

    const typeORMObjectRecordsParser =
      new ObjectRecordsToGraphqlConnectionMapper(objectMetadataMap);

    return typeORMObjectRecordsParser.processRecord<ObjectRecord>(
      updatedRecord,
      objectMetadataItem.nameSingular,
      1,
      1,
    );
  }

  validate<ObjectRecord extends IRecord = IRecord>(
    args: UpdateOneResolverArgs<Partial<ObjectRecord>>,
    options: WorkspaceQueryRunnerOptions,
  ): void {
    assertMutationNotOnRemoteObject(options.objectMetadataItem);
    assertIsValidUuid(args.id);
  }
}
