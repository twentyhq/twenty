import { Injectable } from '@nestjs/common';

import { type ObjectRecord, OrderByDirection } from 'twenty-shared/types';

import { CommonFindDuplicatesQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-duplicates-query-runner.service';
import { assertFindDuplicatesArgs } from 'src/engine/api/common/guards/assert-find-duplicates-args.guard';
import { type CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';

import { DirectExecutionBaseHandler } from 'src/engine/api/graphql/direct-execution/handlers/direct-execution-base.handler';
import { type ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { IConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/connection.interface';
import { IEdge } from 'src/engine/api/graphql/workspace-query-runner/interfaces/edge.interface';

@Injectable()
export class DirectExecutionFindDuplicatesHandler extends DirectExecutionBaseHandler {
  constructor(
    private readonly commonFindDuplicatesService: CommonFindDuplicatesQueryRunnerService,
  ) {
    super();
  }

  async handle(
    args: Record<string, unknown>,
    context: CommonBaseQueryRunnerContext,
    helper: ObjectRecordsToGraphqlConnectionHelper,
  ): Promise<IConnection<ObjectRecord, IEdge<ObjectRecord>>[]> {
    assertFindDuplicatesArgs(args);

    const objectName = context.flatObjectMetadata.nameSingular;

    const paginatedDuplicates = await this.commonFindDuplicatesService.execute(
      args,
      context,
    );

    return paginatedDuplicates.map(
      (duplicate: {
        records: ObjectRecord[];
        totalCount: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
      }) =>
        helper.createConnection({
          objectRecords: duplicate.records,
          objectName,
          take: duplicate.records.length,
          totalCount: duplicate.totalCount,
          order: [{ id: OrderByDirection.AscNullsFirst }],
          hasNextPage: duplicate.hasNextPage,
          hasPreviousPage: duplicate.hasPreviousPage,
        }),
    );
  }
}
