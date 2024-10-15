import { createState } from 'twenty-ui';

export type WebhookGraphOptions = '7D' | '1D' | '12H' | '4H';

export const webhookGraphOptionsState = createState<WebhookGraphOptions>({
  key: 'webhookGraphOptions',
  defaultValue: '7D',
});
