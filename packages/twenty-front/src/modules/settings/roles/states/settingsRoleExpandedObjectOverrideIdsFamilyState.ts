import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const settingsRoleExpandedObjectOverrideIdsFamilyState =
  createAtomFamilyState<string[], string>({
    key: 'settingsRoleExpandedObjectOverrideIdsFamilyState',
    scope: 'routed-flow',
    defaultValue: [],
  });
