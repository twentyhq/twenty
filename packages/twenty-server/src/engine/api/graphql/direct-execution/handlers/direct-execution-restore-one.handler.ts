import { Injectable } from '@nestjs/common';

import { CommonRestoreOneQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-restore-one-query-runner.service';
import { assertRestoreOneArgs } from 'src/engine/api/common/guards/assert-restore-one-args.guard';
import { type CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';

import { DirectExecutionBaseHandler } from 'src/engine/api/graphql/direct-execution/handlers/direct-execution-base.handler';
import { type ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';
import { ObjectRecord } from 'twenty-shared/types';

@Injectable()
export class DirectExecutionRestoreOneHandler extends DirectExecutionBaseHandler {
  constructor(
    private readonly commonRestoreOneService: CommonRestoreOneQueryRunnerService,
  ) {
    super();
  }

  async handle(
    args: Record<string, unknown>,
    context: CommonBaseQueryRunnerContext,
    helper: ObjectRecordsToGraphqlConnectionHelper,
  ): Promise<ObjectRecord> {
    assertRestoreOneArgs(args);

    const record = await this.commonRestoreOneService.execute(args, context);

    return helper.processRecord({
      objectRecord: record,
      objectName: context.flatObjectMetadata.nameSingular,
      take: 1,
      totalCount: 1,
    });
  }
}
