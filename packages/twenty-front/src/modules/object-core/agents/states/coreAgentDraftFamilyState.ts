import { type CoreAgentDraft } from '@/object-core/agents/types/CoreAgentDraft';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const coreAgentDraftFamilyState = createAtomFamilyState<
  CoreAgentDraft | undefined,
  string
>({
  key: 'coreAgentDraftFamilyState',
  defaultValue: undefined,
});
