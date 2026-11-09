import { DASHBOARD_FILTER_URL_OPERANDS } from '@/page-layout/constants/DashboardFilterUrlOperands';
import {
  type PageLayoutFilterValue,
  ViewFilterOperand,
} from 'twenty-shared/types';
import {
  getDashboardFilterConditionValueIssue,
  isDefined,
} from 'twenty-shared/utils';
import z from 'zod';

const DASHBOARD_FILTER_URL_OPERAND_SET = new Set<string>(
  DASHBOARD_FILTER_URL_OPERANDS,
);

const conditionValueByOperandSchema = z
  .partialRecord(z.enum(ViewFilterOperand), z.string())
  .refine((conditionValueByOperand) =>
    Object.keys(conditionValueByOperand).every((operand) =>
      DASHBOARD_FILTER_URL_OPERAND_SET.has(operand),
    ),
  );

// An empty value is the viewer's explicit "no filter", which overrides the layout default
export const dashboardFilterUrlValueSchema = z
  .union([z.literal(''), conditionValueByOperandSchema])
  .transform((urlValue): PageLayoutFilterValue => ({
    conditions:
      urlValue === ''
        ? []
        : DASHBOARD_FILTER_URL_OPERANDS.flatMap((operand) => {
            const value = urlValue[operand];

            return isDefined(value) ? [{ operand, value }] : [];
          }),
  }))
  .refine(({ conditions }) =>
    conditions.every(
      (condition) =>
        !isDefined(getDashboardFilterConditionValueIssue(condition)) &&
        (conditions.length <= 1 ||
          condition.operand === ViewFilterOperand.IS_AFTER ||
          condition.operand === ViewFilterOperand.IS_BEFORE),
    ),
  );
