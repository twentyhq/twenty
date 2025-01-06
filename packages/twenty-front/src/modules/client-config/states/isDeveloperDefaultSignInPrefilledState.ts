import { createState } from '@ui/utilities/state/utils/createState';

export const isDeveloperDefaultSignInPrefilledState = createState<boolean>({
  key: 'isDeveloperDefaultSignInPrefilledState',
  defaultValue: false,
});
