import { type CoreAgentEditSession } from '@/object-core/agents/types/CoreAgentEditSession';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const coreAgentEditSessionFamilyState = createAtomFamilyState<
  CoreAgentEditSession | undefined,
  string
>({
  key: 'coreAgentEditSessionFamilyState',
  scope: 'routed-flow',
  defaultValue: undefined,
});
