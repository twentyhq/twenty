import { useEffect } from 'react';

import { EMPTY_CORE_AGENTS_SELECTION } from '@/object-core/agents/constants/EmptyCoreAgentsSelection';
import { coreAgentsSelectionState } from '@/object-core/agents/states/coreAgentsSelectionState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const CoreAgentsSelectionResetEffect = () => {
  const setCoreAgentsSelection = useSetAtomState(coreAgentsSelectionState);

  useEffect(
    () => () => setCoreAgentsSelection(EMPTY_CORE_AGENTS_SELECTION),
    [setCoreAgentsSelection],
  );

  return null;
};
