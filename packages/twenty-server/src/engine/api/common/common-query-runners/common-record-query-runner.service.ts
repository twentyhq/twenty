import { Injectable } from '@nestjs/common';

import { type ObjectRecord } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { CommonBaseQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-base-query-runner.service';
import { type CommonQueryArgs } from 'src/engine/api/common/types/common-query-args.type';
import { type CommonQueryResultProcessingArgs } from 'src/engine/api/common/types/common-query-result-processing-args.type';

@Injectable()
export abstract class CommonRecordQueryRunnerService<
  Args extends CommonQueryArgs,
  Output extends ObjectRecord | ObjectRecord[],
> extends CommonBaseQueryRunnerService<Args, Output> {
  protected async processQueryResult({
    queryResult,
    ...resultGettersArgs
  }: CommonQueryResultProcessingArgs<Output>): Promise<Output> {
    if (Array.isArray(queryResult)) {
      return (await this.commonResultGettersService.processRecordArray({
        records: queryResult,
        ...resultGettersArgs,
      })) as Output;
    }

    return (await this.commonResultGettersService.processRecord({
      record: queryResult,
      ...resultGettersArgs,
    })) as Output;
  }

  protected getResultRecords(results: Output): ObjectRecord[] {
    return (Array.isArray(results) ? results : [results]).filter(isDefined);
  }
}
