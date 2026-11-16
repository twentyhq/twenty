import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { emailComposerDraftFamilyState } from '@/activities/emails/states/emailComposerDraftFamilyState';
import { type EmailComposerDraft } from '@/activities/emails/types/EmailComposerDraft';
import { useAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyState';

export const useEmailComposerDraft = (draftKey: string | undefined) => {
  const [localDraft, setLocalDraft] = useState<EmailComposerDraft | null>(null);
  const [persistedDraft, setPersistedDraft] = useAtomFamilyState(
    emailComposerDraftFamilyState,
    draftKey ?? '',
  );

  return isDefined(draftKey)
    ? ([persistedDraft, setPersistedDraft] as const)
    : ([localDraft, setLocalDraft] as const);
};
