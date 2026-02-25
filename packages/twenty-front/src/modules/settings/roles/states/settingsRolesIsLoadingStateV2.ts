import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const settingsRolesIsLoadingStateV2 = createAtomState<boolean>({
  key: 'settingsRolesIsLoadingStateV2',
  defaultValue: true,
});
