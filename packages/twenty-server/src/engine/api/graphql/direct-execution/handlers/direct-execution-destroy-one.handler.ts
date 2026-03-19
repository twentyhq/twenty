import { Injectable } from '@nestjs/common';

import { ObjectRecord } from 'twenty-shared/types';

import { CommonDestroyOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-destroy-one-query-runner.service';
import { assertDestroyOneArgs } from 'src/engine/api/common/guards/assert-destroy-one-args.guard';
import { type CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';

import { DirectExecutionBaseHandler } from 'src/engine/api/graphql/direct-execution/handlers/direct-execution-base.handler';
import { type ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';

@Injectable()
export class DirectExecutionDestroyOneHandler extends DirectExecutionBaseHandler {
  constructor(
    private readonly commonDestroyOneService: CommonDestroyOneQueryRunnerService,
  ) {
    super();
  }

  async handle(
    args: Record<string, unknown>,
    context: CommonBaseQueryRunnerContext,
    helper: ObjectRecordsToGraphqlConnectionHelper,
  ): Promise<ObjectRecord> {
    assertDestroyOneArgs(args);

    const record = await this.commonDestroyOneService.execute(args, context);

    return helper.processRecord({
      objectRecord: record,
      objectName: context.flatObjectMetadata.nameSingular,
      take: 1,
      totalCount: 1,
    });
  }
}
