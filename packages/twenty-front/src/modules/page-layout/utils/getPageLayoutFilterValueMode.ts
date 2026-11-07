import { type PageLayoutFilterValueMode } from '@/page-layout/types/PageLayoutFilterValueMode';
import { isNonEmptyArray } from 'twenty-shared/utils';
import {
  type PageLayoutFilterValue,
  ViewFilterOperand,
} from '~/generated-metadata/graphql';

const DATE_RANGE_OPERANDS = [
  ViewFilterOperand.IS_AFTER,
  ViewFilterOperand.IS_BEFORE,
];

export const getPageLayoutFilterValueMode = (
  pageLayoutFilterValue: Pick<PageLayoutFilterValue, 'conditions'> | null,
): PageLayoutFilterValueMode => {
  const operands = (pageLayoutFilterValue?.conditions ?? []).map(
    ({ operand }) => operand,
  );

  if (!isNonEmptyArray(operands)) {
    return 'NONE';
  }

  if (operands.length === 1 && operands[0] === ViewFilterOperand.IS_RELATIVE) {
    return 'RELATIVE';
  }

  const isDateRange =
    operands.every((operand) => DATE_RANGE_OPERANDS.includes(operand)) &&
    new Set(operands).size === operands.length;

  return isDateRange ? 'DATE_RANGE' : 'CUSTOM';
};
