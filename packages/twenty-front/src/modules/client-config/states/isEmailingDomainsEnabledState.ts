import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const isEmailingDomainsEnabledState = createStateV2<boolean>({
  key: 'isEmailingDomainsEnabled',
  defaultValue: false,
});
