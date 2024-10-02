import { Injectable } from '@nestjs/common';

import { ResolverService } from 'src/engine/api/graphql/graphql-query-runner/interfaces/resolver-service.interface';
import { Record as IRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { UpdateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { GraphqlQueryParser } from 'src/engine/api/graphql/graphql-query-runner/graphql-query-parsers/graphql-query.parser';
import { getObjectMetadataOrThrow } from 'src/engine/api/graphql/graphql-query-runner/utils/get-object-metadata-or-throw.util';
import { assertIsValidUuid } from 'src/engine/api/graphql/workspace-query-runner/utils/assert-is-valid-uuid.util';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';
import { generateObjectMetadataMap } from 'src/engine/metadata-modules/utils/generate-object-metadata-map.util';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';

@Injectable()
export class GraphqlQueryUpdateManyResolverService
  implements ResolverService<UpdateManyResolverArgs, IRecord[]>
{
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async resolve<ObjectRecord extends IRecord = IRecord>(
    args: UpdateManyResolverArgs<Partial<ObjectRecord>>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<ObjectRecord[]> {
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
    const objectMetadata = getObjectMetadataOrThrow(
      objectMetadataMap,
      objectMetadataItem.nameSingular,
    );
    const graphqlQueryParser = new GraphqlQueryParser(
      objectMetadata.fields,
      objectMetadataMap,
    );

    const queryBuilder = repository.createQueryBuilder(
      objectMetadataItem.nameSingular,
    );

    const withFilterQueryBuilder = graphqlQueryParser.applyFilterToBuilder(
      queryBuilder,
      objectMetadataItem.nameSingular,
      args.filter,
    );

    await withFilterQueryBuilder.update().set(args.data).execute();

    const nonFormattedUpdatedObjectRecords =
      await withFilterQueryBuilder.getMany();

    const updatedRecords = formatResult(
      nonFormattedUpdatedObjectRecords,
      objectMetadata,
      objectMetadataMap,
    );

    return updatedRecords as ObjectRecord[];
  }

  validate<ObjectRecord extends IRecord = IRecord>(
    args: UpdateManyResolverArgs<Partial<ObjectRecord>>,
    options: WorkspaceQueryRunnerOptions,
  ): void {
    assertMutationNotOnRemoteObject(options.objectMetadataItem);
    args.filter?.id?.in?.forEach((id: string) => assertIsValidUuid(id));
  }
}
