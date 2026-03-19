import { Injectable } from '@nestjs/common';

import { CommonMergeManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-merge-many-query-runner.service';
import { assertMergeManyArgs } from 'src/engine/api/common/guards/assert-merge-many-args.guard';
import { type CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';

import { DirectExecutionBaseHandler } from 'src/engine/api/graphql/direct-execution/handlers/direct-execution-base.handler';
import { type ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';

import { type ObjectRecord } from 'twenty-shared/types';

@Injectable()
export class DirectExecutionMergeManyHandler extends DirectExecutionBaseHandler {
  constructor(
    private readonly commonMergeManyService: CommonMergeManyQueryRunnerService,
  ) {
    super();
  }

  async handle(
    args: Record<string, unknown>,
    context: CommonBaseQueryRunnerContext,
    helper: ObjectRecordsToGraphqlConnectionHelper,
  ): Promise<ObjectRecord> {
    assertMergeManyArgs(args);

    const record = await this.commonMergeManyService.execute(args, context);

    return helper.processRecord({
      objectRecord: record,
      objectName: context.flatObjectMetadata.nameSingular,
      take: 1,
      totalCount: 1,
    });
  }
}
