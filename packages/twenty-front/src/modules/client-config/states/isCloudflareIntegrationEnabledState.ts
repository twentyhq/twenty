import { createState } from '@/ui/utilities/state/utils/createState';

export const isCloudflareIntegrationEnabledState = createState<boolean>({
  key: 'isCloudflareIntegrationEnabled',
  defaultValue: false,
});
