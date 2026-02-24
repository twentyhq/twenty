import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const verifyEmailRedirectPathState = createState<string | undefined>({
  key: 'verifyEmailRedirectPathState',
  defaultValue: undefined,
});
