import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const allowRequestsToTwentyIconsState = createState<boolean>({
  key: 'allowRequestsToTwentyIcons',
  defaultValue: true,
});
