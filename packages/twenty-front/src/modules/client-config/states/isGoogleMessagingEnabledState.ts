import { createState } from '@/ui/utilities/state/jotai/utils/createState';
export const isGoogleMessagingEnabledState = createState<boolean>({
  key: 'isGoogleMessagingEnabled',
  defaultValue: false,
});
