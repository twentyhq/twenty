import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const isCloudflareIntegrationEnabledState = createState<boolean>({
  key: 'isCloudflareIntegrationEnabled',
  defaultValue: false,
});
