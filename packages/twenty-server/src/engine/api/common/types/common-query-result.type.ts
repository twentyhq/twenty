import { type ObjectRecord } from 'twenty-shared/types';

import { type CommonRelationsAggregatedValues } from 'src/engine/api/common/types/common-aggregated-values.type';
import { type CommonFindDuplicatesOutputItem } from 'src/engine/api/common/types/common-find-duplicates-output-item.type';
import { type CommonFindManyOutput } from 'src/engine/api/common/types/common-find-many-output.type';
import { type CommonGroupByOutputItem } from 'src/engine/api/common/types/common-group-by-output-item.type';
import {
  CommonExtendedInput,
  CommonQueryArgs,
} from 'src/engine/api/common/types/common-query-args.type';

export type CommonQueryResult =
  | ObjectRecord[]
  | ObjectRecord
  | CommonGroupByOutputItem[]
  | CommonFindManyOutput
  | CommonFindDuplicatesOutputItem[];

export type CommonQueryRunResult<Output extends CommonQueryResult> = {
  result: Output;
  relationAggregatedValues: CommonRelationsAggregatedValues;
};

export type CommonQueryExecutionResult<
  Output extends CommonQueryResult,
  Args extends CommonQueryArgs,
> = {
  results: Output;
  relationAggregatedValues: CommonRelationsAggregatedValues;
  args: CommonExtendedInput<Args>;
};
