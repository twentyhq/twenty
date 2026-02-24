import { createState } from '@/ui/utilities/state/jotai/utils/createState';
export const isMicrosoftMessagingEnabledState = createState<boolean>({
  key: 'isMicrosoftMessagingEnabled',
  defaultValue: false,
});
