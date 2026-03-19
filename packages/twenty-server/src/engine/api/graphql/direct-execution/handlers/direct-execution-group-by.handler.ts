import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { CommonGroupByQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-group-by-query-runner.service';
import { assertGroupByArgs } from 'src/engine/api/common/guards/assert-group-by-args.guard';
import { type CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';
import { type CommonGroupByOutputItem } from 'src/engine/api/common/types/common-group-by-output-item.type';
import { type CommonSelectedFields } from 'src/engine/api/common/types/common-selected-fields-result.type';

import { DirectExecutionBaseHandler } from 'src/engine/api/graphql/direct-execution/handlers/direct-execution-base.handler';
import { type ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { IEdge } from 'src/engine/api/graphql/workspace-query-runner/interfaces/edge.interface';
import { IPageInfo } from 'src/engine/api/graphql/workspace-query-runner/interfaces/page-info.interface';
import { ObjectRecord } from 'twenty-shared/types';

@Injectable()
export class DirectExecutionGroupByHandler extends DirectExecutionBaseHandler {
  constructor(
    private readonly commonGroupByService: CommonGroupByQueryRunnerService,
  ) {
    super();
  }

  async handle(
    args: Record<string, unknown>,
    context: CommonBaseQueryRunnerContext,
    helper: ObjectRecordsToGraphqlConnectionHelper,
  ): Promise<
    {
      edges: IEdge<ObjectRecord>[];
      pageInfo: IPageInfo;
      totalCount: number;
      groupByDimensionValues: string[];
      records?: ObjectRecord[];
    }[]
  > {
    assertGroupByArgs(args);

    const objectName = context.flatObjectMetadata.nameSingular;

    const edgesNode = (
      args.selectedFields.edges as CommonSelectedFields | undefined
    )?.node;

    const shouldIncludeRecords =
      isDefined(edgesNode) &&
      typeof edgesNode === 'object' &&
      Object.keys(edgesNode).length > 0;

    const results = await this.commonGroupByService.execute(
      { ...args, includeRecords: shouldIncludeRecords },
      context,
    );

    return results.map((group: CommonGroupByOutputItem) => {
      const formattedRecords = helper.createConnection({
        objectRecords: group.records ?? [],
        objectName,
        objectRecordsAggregatedValues: {},
        selectedAggregatedFields: {},
        take: group.records?.length || 0,
        totalCount: Number(group.totalCount ?? 0),
        hasNextPage: false,
        hasPreviousPage: false,
        order: args.orderByForRecords ?? [],
      });

      const { records: _records, ...groupWithoutRecords } = group;

      return {
        ...groupWithoutRecords,
        ...formattedRecords,
      };
    });
  }
}
