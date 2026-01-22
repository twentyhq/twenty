import { createState } from 'twenty-ui/utilities';

export const isCloudflareIntegrationEnabledState = createState<boolean>({
  key: 'isCloudflareIntegrationEnabled',
  defaultValue: false,
});
