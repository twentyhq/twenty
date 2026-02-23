import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
export const isMicrosoftMessagingEnabledState = createStateV2<boolean>({
  key: 'isMicrosoftMessagingEnabled',
  defaultValue: false,
});
