import { Injectable } from '@nestjs/common';

import { type ObjectRecord } from 'twenty-shared/types';

import { CommonRestoreManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-restore-many-query-runner.service';
import { assertRestoreManyArgs } from 'src/engine/api/common/guards/assert-restore-many-args.guard';
import { type CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';

import { DirectExecutionBaseHandler } from 'src/engine/api/graphql/direct-execution/handlers/direct-execution-base.handler';
import { type ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';

@Injectable()
export class DirectExecutionRestoreManyHandler extends DirectExecutionBaseHandler {
  constructor(
    private readonly commonRestoreManyService: CommonRestoreManyQueryRunnerService,
  ) {
    super();
  }

  async handle(
    args: Record<string, unknown>,
    context: CommonBaseQueryRunnerContext,
    helper: ObjectRecordsToGraphqlConnectionHelper,
  ): Promise<ObjectRecord[]> {
    assertRestoreManyArgs(args);

    const records = await this.commonRestoreManyService.execute(args, context);

    return records.map((record: ObjectRecord) =>
      helper.processRecord({
        objectRecord: record,
        objectName: context.flatObjectMetadata.nameSingular,
        take: 1,
        totalCount: 1,
      }),
    );
  }
}
