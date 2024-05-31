import { createState } from 'twenty-ui';

import { detectTimeZone } from '@/workspace-member/utils/detectTimeZone';

export const timeZoneState = createState<string>({
  key: 'timeZoneState',
  defaultValue: detectTimeZone(),
});
