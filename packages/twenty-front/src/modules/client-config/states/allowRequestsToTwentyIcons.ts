import { createState } from '@/ui/utilities/state/utils/createState';

export const allowRequestsToTwentyIconsState = createState<boolean>({
  key: 'allowRequestsToTwentyIcons',
  defaultValue: true,
});
