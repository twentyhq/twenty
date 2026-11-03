import { type CoreAgentCommandOrigin } from '@/object-core/commands/types/CoreAgentCommandOrigin';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const coreAgentCommandOriginFamilyState = createAtomFamilyState<
  CoreAgentCommandOrigin | null,
  string
>({
  key: 'coreAgentCommandOriginFamilyState',
  defaultValue: null,
  scope: 'routed-flow',
});
