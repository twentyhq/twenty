import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isCloudflareIntegrationEnabledState = createAtomState<boolean>({
  key: 'isCloudflareIntegrationEnabled',
  defaultValue: false,
});
