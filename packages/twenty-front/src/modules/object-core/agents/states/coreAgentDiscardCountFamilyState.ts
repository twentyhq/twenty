import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const coreAgentDiscardCountFamilyState = createAtomFamilyState<
  number,
  string
>({
  key: 'coreAgentDiscardCountFamilyState',
  defaultValue: 0,
});
