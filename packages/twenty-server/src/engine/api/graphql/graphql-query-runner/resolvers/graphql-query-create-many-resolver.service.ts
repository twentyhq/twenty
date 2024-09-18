import { InsertResult } from 'typeorm';

import { Record as IRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/record.interface';
import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { CreateManyResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

export class GraphqlQueryCreateManyResolverService {
  private twentyORMGlobalManager: TwentyORMGlobalManager;

  constructor(twentyORMGlobalManager: TwentyORMGlobalManager) {
    this.twentyORMGlobalManager = twentyORMGlobalManager;
  }

  async createMany<ObjectRecord extends IRecord = IRecord>(
    args: CreateManyResolverArgs<Partial<ObjectRecord>>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<ObjectRecord[] | undefined> {
    const { authContext, objectMetadataItem } = options;
    const repository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        authContext.workspace.id,
        objectMetadataItem.nameSingular,
      );

    const insertResult: InsertResult = !args.upsert
      ? await repository.insert(args.data)
      : await repository.upsert(args.data, ['id']);

    return insertResult.generatedMaps as ObjectRecord[];
  }
}
