import { createState } from 'twenty-ui';

import { DateFormat } from '@/workspace-member/constants/DateFormat';
import { detectDateFormat } from '@/workspace-member/utils/detectDateFormat';

export const dateFormatState = createState<DateFormat>({
  key: 'dateFormatState',
  defaultValue: detectDateFormat(),
});
