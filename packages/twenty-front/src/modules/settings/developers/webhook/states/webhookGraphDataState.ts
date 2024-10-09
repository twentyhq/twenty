import { createState } from 'twenty-ui';
import { NivoLineInput } from '~/pages/settings/developers/webhooks/components/SettingsDevelopersWebhookUsageGraph';

export const webhookGraphDataState = createState<NivoLineInput[]>({
  key: 'webhookGraphData',
  defaultValue: [],
});
