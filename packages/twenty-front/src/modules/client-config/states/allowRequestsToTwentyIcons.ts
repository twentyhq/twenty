import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const allowRequestsToTwentyIconsState = createStateV2<boolean>({
  key: 'allowRequestsToTwentyIcons',
  defaultValue: true,
});
