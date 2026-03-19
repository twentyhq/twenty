import { Injectable } from '@nestjs/common';

import { type ObjectRecord } from 'twenty-shared/types';

import { CommonDeleteOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-delete-one-query-runner.service';
import { assertDeleteOneArgs } from 'src/engine/api/common/guards/assert-delete-one-args.guard';
import { type CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';

import { DirectExecutionBaseHandler } from 'src/engine/api/graphql/direct-execution/handlers/direct-execution-base.handler';
import { type ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';

@Injectable()
export class DirectExecutionDeleteOneHandler extends DirectExecutionBaseHandler {
  constructor(
    private readonly commonDeleteOneService: CommonDeleteOneQueryRunnerService,
  ) {
    super();
  }

  async handle(
    args: Record<string, unknown>,
    context: CommonBaseQueryRunnerContext,
    helper: ObjectRecordsToGraphqlConnectionHelper,
  ): Promise<ObjectRecord> {
    assertDeleteOneArgs(args);

    const record = await this.commonDeleteOneService.execute(args, context);

    return helper.processRecord({
      objectRecord: record,
      objectName: context.flatObjectMetadata.nameSingular,
      take: 1,
      totalCount: 1,
    });
  }
}
