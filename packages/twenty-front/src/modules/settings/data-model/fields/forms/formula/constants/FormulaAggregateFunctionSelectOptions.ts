import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type FormulaAggregateFunctionName } from 'twenty-shared/types';
import {
  IconHash,
  IconMathMax,
  IconMathMin,
  IconPercentage,
  IconSum,
  type IconComponent,
} from 'twenty-ui/icon';

type FormulaAggregateFunctionSelectOption = {
  Icon: IconComponent;
  label: MessageDescriptor;
  value: FormulaAggregateFunctionName;
};

export const FORMULA_AGGREGATE_FUNCTION_SELECT_OPTIONS = [
  { Icon: IconHash, label: msg`Count`, value: 'count' },
  { Icon: IconSum, label: msg`Sum`, value: 'sum' },
  { Icon: IconPercentage, label: msg`Average`, value: 'avg' },
  { Icon: IconMathMin, label: msg`Min`, value: 'min' },
  { Icon: IconMathMax, label: msg`Max`, value: 'max' },
] as const satisfies FormulaAggregateFunctionSelectOption[];
