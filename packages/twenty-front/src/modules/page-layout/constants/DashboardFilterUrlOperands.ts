import { DASHBOARD_FILTER_PLAIN_DATE_OPERANDS } from 'twenty-shared/constants';
import { ViewFilterOperand } from 'twenty-shared/types';

export const DASHBOARD_FILTER_URL_OPERANDS: ViewFilterOperand[] = [
  ViewFilterOperand.IS_RELATIVE,
  ...DASHBOARD_FILTER_PLAIN_DATE_OPERANDS,
];
