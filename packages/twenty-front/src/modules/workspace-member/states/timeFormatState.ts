import { createState } from 'twenty-ui';

import { TimeFormat } from '@/workspace-member/constants/TimeFormat';
import { detectTimeFormat } from '@/workspace-member/utils/detectTimeFormat';

export const timeFormatState = createState<TimeFormat>({
  key: 'timeFormatState',
  defaultValue: detectTimeFormat(),
});
