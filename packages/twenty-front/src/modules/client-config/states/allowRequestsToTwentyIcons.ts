import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const allowRequestsToTwentyIconsState = createAtomState<boolean>({
  key: 'allowRequestsToTwentyIcons',
  defaultValue: true,
});
