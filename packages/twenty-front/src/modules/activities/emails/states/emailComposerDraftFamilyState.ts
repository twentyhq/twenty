import { type EmailComposerDraft } from '@/activities/emails/types/EmailComposerDraft';
import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const emailComposerDraftFamilyState = createAtomFamilyState<
  EmailComposerDraft | null,
  string
>({
  key: 'activities/emailComposerDraftFamilyState',
  defaultValue: null,
  useSessionStorage: true,
});
