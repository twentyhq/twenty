import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const settingsRoleIdsState = createAtomState<string[]>({
  key: 'settingsRoleIdsState',
  defaultValue: [],
});
