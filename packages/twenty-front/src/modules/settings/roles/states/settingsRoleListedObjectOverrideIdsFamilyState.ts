import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

// Objects added or opened while editing stay listed even once they match the all-objects access again
export const settingsRoleListedObjectOverrideIdsFamilyState =
  createAtomFamilyState<string[], string>({
    key: 'settingsRoleListedObjectOverrideIdsFamilyState',
    scope: 'routed-flow',
    defaultValue: [],
  });
