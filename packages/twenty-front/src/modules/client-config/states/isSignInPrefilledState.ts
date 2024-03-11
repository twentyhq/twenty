import { createState } from '@/ui/utilities/state/utils/createState';

export const isSignInPrefilledState = createState<boolean>({
  key: 'isSignInPrefilledState',
  defaultValue: false,
});
