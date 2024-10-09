import { NivoLineInput } from '@/settings/developers/webhook/components/SettingsDevelopersWebhookUsageGraph';
import { createState } from 'twenty-ui';

export const webhookGraphDataState = createState<NivoLineInput[]>({
  key: 'webhookGraphData',
  defaultValue: [],
});
