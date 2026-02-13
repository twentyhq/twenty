import { createState } from '@/ui/utilities/state/utils/createState';
export const isGoogleMessagingEnabledState = createState<boolean>({
  key: 'isGoogleMessagingEnabled',
  defaultValue: false,
});
