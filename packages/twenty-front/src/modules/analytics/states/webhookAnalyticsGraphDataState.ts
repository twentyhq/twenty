import { NivoLineInput } from '@/analytics/types/NivoLineInput';

import { createState } from 'twenty-ui';

export const webhookAnalyticsGraphDataState = createState<NivoLineInput[]>({
  key: 'webhookAnalyticsGraphData',
  defaultValue: [],
});
