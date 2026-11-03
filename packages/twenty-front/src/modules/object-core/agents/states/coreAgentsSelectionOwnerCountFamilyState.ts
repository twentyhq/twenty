import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const coreAgentsSelectionOwnerCountFamilyState = createAtomFamilyState<
  number,
  string
>({ key: 'coreAgentsSelectionOwnerCountFamilyState', defaultValue: 0 });
