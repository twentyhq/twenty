import { createState } from '@/ui/utilities/state/utils/createState';

export const isSignUpDisabledState = createState<boolean>({
  key: 'isSignUpDisabledState',
  defaultValue: false,
});
