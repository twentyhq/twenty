import { Injectable } from '@nestjs/common';

import {
  GraphqlQueryBaseResolverService,
  type GraphqlQueryResolverExecutionArgs,
} from 'src/engine/api/graphql/graphql-query-runner/interfaces/base-resolver-service';
import { type ObjectRecord } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { WorkspaceQueryRunnerOptions } from 'src/engine/api/graphql/workspace-query-runner/interfaces/query-runner-option.interface';
import { type CreateOneResolverArgs } from 'src/engine/api/graphql/workspace-resolver-builder/interfaces/workspace-resolvers-builder.interface';

import { GraphqlQueryCreateManyResolverService } from 'src/engine/api/graphql/graphql-query-runner/resolvers/graphql-query-create-many-resolver.service';
import { assertIsValidUuid } from 'src/engine/api/graphql/workspace-query-runner/utils/assert-is-valid-uuid.util';
import { assertMutationNotOnRemoteObject } from 'src/engine/metadata-modules/object-metadata/utils/assert-mutation-not-on-remote-object.util';

@Injectable()
export class GraphqlQueryCreateOneResolverService extends GraphqlQueryBaseResolverService<
  CreateOneResolverArgs,
  ObjectRecord
> {
  constructor(
    private readonly createManyResolverService: GraphqlQueryCreateManyResolverService,
  ) {
    super();
  }

  async resolve(
    executionArgs: GraphqlQueryResolverExecutionArgs<CreateOneResolverArgs>,
  ): Promise<ObjectRecord> {
    const result = await this.createManyResolverService.resolve({
      ...executionArgs,
      args: {
        ...executionArgs.args,
        data: [executionArgs.args.data],
      },
    });

    return result[0];
  }

  async validate(
    args: CreateOneResolverArgs<Partial<ObjectRecord>>,
    options: WorkspaceQueryRunnerOptions,
  ): Promise<void> {
    assertMutationNotOnRemoteObject(options.objectMetadataItemWithFieldMaps);

    if (args.data?.id) {
      assertIsValidUuid(args.data.id);
    }
  }
}
