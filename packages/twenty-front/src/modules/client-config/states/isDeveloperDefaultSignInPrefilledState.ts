import { createState } from '@/ui/utilities/state/jotai/utils/createState';
export const isDeveloperDefaultSignInPrefilledState = createState<boolean>({
  key: 'isDeveloperDefaultSignInPrefilledState',
  defaultValue: false,
});
