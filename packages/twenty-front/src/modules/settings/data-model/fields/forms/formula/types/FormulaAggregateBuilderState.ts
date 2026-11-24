import { type FormulaAggregateFunctionName } from 'twenty-shared/types';

import { type FormulaAggregateCondition } from '@/settings/data-model/fields/forms/formula/types/FormulaAggregateCondition';

export type FormulaAggregateBuilderState = {
  relationFieldName: string;
  functionName: FormulaAggregateFunctionName;
  aggregatedFieldName?: string;
  conditions: FormulaAggregateCondition[];
};
