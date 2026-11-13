import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const chatThreadComposerDraftFamilyState = createAtomFamilyState<
  string,
  string
>({
  key: 'activities/chatThreadComposerDraftFamilyState',
  defaultValue: '',
  useSessionStorage: true,
});
