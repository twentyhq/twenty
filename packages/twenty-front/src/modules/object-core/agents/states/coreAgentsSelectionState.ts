import { EMPTY_CORE_AGENTS_SELECTION } from '@/object-core/agents/constants/EmptyCoreAgentsSelection';
import { type CoreAgentsSelection } from '@/object-core/agents/types/CoreAgentsSelection';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const coreAgentsSelectionState = createAtomState<CoreAgentsSelection>({
  key: 'coreAgentsSelectionState',
  defaultValue: EMPTY_CORE_AGENTS_SELECTION,
});
