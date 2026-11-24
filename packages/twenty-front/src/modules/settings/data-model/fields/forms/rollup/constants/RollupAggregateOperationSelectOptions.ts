import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import {
  AggregateOperations,
  type RollupAggregateOperation,
} from 'twenty-shared/types';
import {
  IconHash,
  IconMathMax,
  IconMathMin,
  IconPercentage,
  IconSum,
  type IconComponent,
} from 'twenty-ui/icon';

type RollupAggregateOperationSelectOption = {
  Icon: IconComponent;
  label: MessageDescriptor;
  value: RollupAggregateOperation;
};

export const ROLLUP_AGGREGATE_OPERATION_SELECT_OPTIONS = [
  { Icon: IconHash, label: msg`Count`, value: AggregateOperations.COUNT },
  { Icon: IconSum, label: msg`Sum`, value: AggregateOperations.SUM },
  { Icon: IconPercentage, label: msg`Average`, value: AggregateOperations.AVG },
  { Icon: IconMathMin, label: msg`Min`, value: AggregateOperations.MIN },
  { Icon: IconMathMax, label: msg`Max`, value: AggregateOperations.MAX },
] as const satisfies RollupAggregateOperationSelectOption[];
