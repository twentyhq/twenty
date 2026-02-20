import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
export const isGoogleMessagingEnabledState = createStateV2<boolean>({
  key: 'isGoogleMessagingEnabled',
  defaultValue: false,
});
