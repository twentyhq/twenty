import { EMPTY_CORE_AGENTS_SELECTION } from '@/object-core/agents/constants/EmptyCoreAgentsSelection';
import { type CoreAgentsSelection } from '@/object-core/agents/types/CoreAgentsSelection';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const coreAgentsSelectionFamilyState = createAtomFamilyState<
  CoreAgentsSelection,
  string
>({
  key: 'coreAgentsSelectionFamilyState',
  defaultValue: EMPTY_CORE_AGENTS_SELECTION,
});
