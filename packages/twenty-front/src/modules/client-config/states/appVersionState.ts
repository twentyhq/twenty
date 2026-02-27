import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const appVersionState = createAtomState<string | undefined>({
  key: 'appVersion',
  defaultValue: undefined,
});
