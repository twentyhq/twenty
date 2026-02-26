import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const verifyEmailRedirectPathState = createAtomState<string | undefined>(
  {
    key: 'verifyEmailRedirectPathState',
    defaultValue: undefined,
  },
);
