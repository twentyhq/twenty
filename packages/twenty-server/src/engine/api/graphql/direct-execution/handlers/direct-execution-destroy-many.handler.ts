import { Injectable } from '@nestjs/common';

import { ObjectRecord } from 'twenty-shared/types';

import { CommonDestroyManyQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-destroy-many-query-runner.service';
import { assertDestroyManyArgs } from 'src/engine/api/common/guards/assert-destroy-many-args.guard';
import { type CommonBaseQueryRunnerContext } from 'src/engine/api/common/types/common-base-query-runner-context.type';

import { DirectExecutionBaseHandler } from 'src/engine/api/graphql/direct-execution/handlers/direct-execution-base.handler';
import { type ObjectRecordsToGraphqlConnectionHelper } from 'src/engine/api/graphql/graphql-query-runner/helpers/object-records-to-graphql-connection.helper';

@Injectable()
export class DirectExecutionDestroyManyHandler extends DirectExecutionBaseHandler {
  constructor(
    private readonly commonDestroyManyService: CommonDestroyManyQueryRunnerService,
  ) {
    super();
  }

  async handle(
    args: Record<string, unknown>,
    context: CommonBaseQueryRunnerContext,
    helper: ObjectRecordsToGraphqlConnectionHelper,
  ): Promise<ObjectRecord[]> {
    assertDestroyManyArgs(args);

    const records = await this.commonDestroyManyService.execute(args, context);

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
