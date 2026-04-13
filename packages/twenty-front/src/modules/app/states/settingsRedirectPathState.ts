import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const settingsRedirectPathState = createAtomState<string | undefined>({
  key: 'settingsRedirectPathState',
  defaultValue: undefined,
});
