import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const settingsRolesIsLoadingState = createAtomState<boolean>({
  key: 'settingsRolesIsLoadingState',
  defaultValue: true,
});
