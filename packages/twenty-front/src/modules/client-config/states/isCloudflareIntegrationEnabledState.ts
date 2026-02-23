import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const isCloudflareIntegrationEnabledState = createStateV2<boolean>({
  key: 'isCloudflareIntegrationEnabled',
  defaultValue: false,
});
