import { createState } from '@/ui/utilities/state/utils/createState';
export const isMicrosoftMessagingEnabledState = createState<boolean>({
  key: 'isMicrosoftMessagingEnabled',
  defaultValue: false,
});
