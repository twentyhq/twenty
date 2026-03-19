import { Injectable } from '@nestjs/common';

import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';

import { CommonFindManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-many-query-runner.service';
import { assertFindManyArgs } from 'src/engine/api/common/guards/assert-find-many-args.guard';
import { type CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';

import { DirectExecutionBaseHandler } from 'src/engine/api/graphql/direct-execution/handlers/direct-execution-base.handler';
import { type ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { IConnection } from 'src/engine/api/graphql/workspace-query-runner/interfaces/connection.interface';
import { IEdge } from 'src/engine/api/graphql/workspace-query-runner/interfaces/edge.interface';
import { ObjectRecord } from 'twenty-shared/types';

@Injectable()
export class DirectExecutionFindManyHandler extends DirectExecutionBaseHandler {
  constructor(
    private readonly commonFindManyService: CommonFindManyQueryRunnerService,
  ) {
    super();
  }

  async handle(
    args: Record<string, unknown>,
    context: CommonBaseQueryRunnerContext,
    helper: ObjectRecordsToGraphqlConnectionHelper,
  ): Promise<IConnection<ObjectRecord, IEdge<ObjectRecord>>> {
    assertFindManyArgs(args);

    const objectName = context.flatObjectMetadata.nameSingular;

    const {
      records,
      aggregatedValues,
      totalCount,
      pageInfo,
      selectedFieldsResult,
    } = await this.commonFindManyService.execute(args, context);

    return helper.createConnection({
      objectRecords: records,
      objectRecordsAggregatedValues: aggregatedValues,
      selectedAggregatedFields: selectedFieldsResult.aggregate,
      objectName,
      take: args.first ?? args.last ?? QUERY_MAX_RECORDS,
      totalCount,
      order: args.orderBy,
      hasNextPage: pageInfo.hasNextPage,
      hasPreviousPage: pageInfo.hasPreviousPage,
    });
  }
}
