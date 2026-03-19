import { Injectable } from '@nestjs/common';

import { CommonFindOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-find-one-query-runner.service';
import { assertFindOneArgs } from 'src/engine/api/common/guards/assert-find-one-args.guard';
import { type CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';

import { DirectExecutionBaseHandler } from 'src/engine/api/graphql/direct-execution/handlers/direct-execution-base.handler';
import { ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { ObjectRecord } from 'twenty-shared/types';

@Injectable()
export class DirectExecutionFindOneHandler extends DirectExecutionBaseHandler {
  constructor(
    private readonly commonFindOneService: CommonFindOneQueryRunnerService,
  ) {
    super();
  }

  async handle(
    args: Record<string, unknown>,
    context: CommonBaseQueryRunnerContext,
    helper: ObjectRecordsToGraphqlConnectionHelper,
  ): Promise<ObjectRecord> {
    assertFindOneArgs(args);

    const record = await this.commonFindOneService.execute(args, context);

    return helper.processRecord({
      objectRecord: record,
      objectName: context.flatObjectMetadata.nameSingular,
      take: 1,
      totalCount: 1,
    });
  }
}
