import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const verifyEmailRedirectPathState = createStateV2<string | undefined>({
  key: 'verifyEmailRedirectPathState',
  defaultValue: undefined,
});
